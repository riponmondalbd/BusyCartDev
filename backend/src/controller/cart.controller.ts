import { prisma } from "../prisma/prisma";

// add to cart
export const addToCart = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId },
        });
      }

      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          throw new Error(
            `Cannot add more than available stock (${product.stock})`,
          );
        }

        return tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        return tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Failed to add to cart",
    });
  }
};

// update cart
export const updateCartItem = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const parsedQuantity = Number(quantity);

    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a valid number at least 1",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!item) {
      return res.status(404).json({
        message:
          "Cart item not found. Please ensure you are using the 'itemId' from your cart response.",
      });
    }

    if (item.cartId !== cart.id) {
      return res.status(403).json({
        message: "Unauthorized access to this cart item",
      });
    }

    if (parsedQuantity > item.product.stock) {
      return res.status(400).json({
        message: `Only ${item.product.stock} items available in stock`,
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: parsedQuantity },
      include: {
        product: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to update cart",
    });
  }
};

// remove cart
export const removeCartItem = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    if (item.cartId !== cart.id) {
      return res.status(403).json({
        message: "Unauthorized access to this cart item",
      });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to remove item",
    });
  }
};

// get my cart
export const getMyCart = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        totalItems: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        appliedCoupon: null,
        items: [],
      });
    }

    let subtotal = 0;
    let totalItems = 0;

    const formattedItems = cart.items.map((item) => {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      return {
        itemId: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        stock: item.product.stock,
        image: item.product.images?.[0] || null,
        itemTotal,
      };
    });

    let discountAmount = 0;
    let appliedCoupon = null;

    // Check if cart has a coupon natively attached
    if (cart.appliedCoupon) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: cart.appliedCoupon },
      });

      // Verify coupon is still valid
      if (
        coupon &&
        new Date() <= coupon.expiresAt &&
        (!coupon.minAmount || subtotal >= coupon.minAmount)
      ) {
        discountAmount =
          coupon.type === "FIXED"
            ? coupon.discount
            : (subtotal * coupon.discount) / 100;
        appliedCoupon = coupon;
      } else {
        // If it became invalid (expired, or subtotal dropped below minAmount), remove it from cart
        await prisma.cart.update({
          where: { id: cart.id },
          data: { appliedCoupon: null },
        });
      }
    }

    return res.status(200).json({
      success: true,
      totalItems,
      subtotal,
      discountAmount,
      total: subtotal - discountAmount,
      appliedCoupon,
      items: formattedItems,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch cart",
    });
  }
};

// clear cart
export const clearCart = async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to clear cart",
    });
  }
};
