import { Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "../prisma/prisma";

// Generate detailed invoice PDF
export const generateInvoice = async (req: any, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Fetch order with items, product info, and user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        user: true, // get customer info
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Ensure user owns the order if not admin
    if (req.user.role === "USER" && order.userId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Stream to response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${orderId}.pdf`,
    );
    doc.pipe(res);

    // Company Logo (replace with your logo URL)
    const logoUrl = "https://yourdomain.com/logo.png"; // optional
    try {
      doc.image(logoUrl, 50, 45, { width: 100 });
    } catch {
      // skip if logo not found
    }

    // Company Info
    doc.fontSize(16).text("BusyCart", 200, 50);
    doc.fontSize(10).text("123 Market Street, Dhaka, Bangladesh", 200, 70);
    doc.text("Email: support@busycart.com", 200, 85);
    doc.moveDown(2);

    // Invoice Header
    doc.fontSize(14).text("Invoice", { align: "center" });
    doc.moveDown();

    // Customer Info
    doc.fontSize(12).text("Customer Info:", { underline: true });
    doc.text(`Name: ${order.user.name || "N/A"}`);
    doc.text(`Email: ${order.user.email}`);
    // doc.text(`Address: ${order.user.address || "N/A"}`); // assume you have address field
    doc.moveDown();

    // Order Info
    doc.text(`Order ID: ${order.id}`);
    doc.text(`Date: ${order.createdAt.toDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    // Table Header
    doc.text("Products:", { underline: true });
    doc.moveDown(0.5);

    // Table Rows
    order.items.forEach((item) => {
      doc.text(
        `${item.product.name} - Qty: ${item.quantity} - Price: $${item.price} - Subtotal: $${item.price * item.quantity}`,
      );
    });

    doc.moveDown();

    // Tax, Shipping & Discount (now stored in the order object)
    const tax = order.tax || 0;
    const shipping = order.shipping || 0;
    const discount = order.discount || 0;
    const total = order.total;

    doc.text(`Subtotal: $${order.subtotal}`);
    if (discount > 0) doc.text(`Discount: -$${discount}`);
    doc.text(`Tax: $${tax}`);
    doc.text(`Shipping: $${shipping}`);
    doc.text(`Total: $${total}`);

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .text("Thank you for shopping with BusyCart!", { align: "center" });

    doc.end();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
      error: error.message,
    });
  }
};
