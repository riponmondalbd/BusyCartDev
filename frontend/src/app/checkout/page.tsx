"use client";

import { fetchApi } from "@/utils/api";
import { ArrowRight, CreditCard, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "@/components/Skeleton";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Stripe Simulation");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchApi("/cart/my-cart");
        const data = res.data || res;
        if (!data.items || data.items.length === 0) {
          router.push("/products");
          return;
        }
        setCart(data);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handlePlaceOrder = async () => {
    if (!address || !city || !zip) {
      toast.error("Please provide your delivery coordinates (Address).");
      return;
    }

    setProcessing(true);
    try {
      // 1. Create order
      const orderRes = await fetchApi("/order/create", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress: `${address}, ${city}, ${zip}`,
        }),
      });

      console.log("Order response:", orderRes);
      const orderId =
        orderRes?.data?.order?.id || orderRes?.data?.id || orderRes?.id;

      if (!orderId) {
        toast.error("Failed to create order: No order ID received");
        console.error("Order response structure:", orderRes);
        return;
      }

      console.log(
        "Placing payment for orderId:",
        orderId,
        "method:",
        paymentMethod,
      );

      // 2. Simulate payment or confirm COD
      const paymentRes = await fetchApi("/payment/simulate", {
        method: "POST",
        body: JSON.stringify({ orderId, method: paymentMethod }),
      });

      console.log("Payment response:", paymentRes);

      toast.success(
        "TRANSACTION SUCCESSFUL. Order dispatched to the logistics matrix.",
      );
      router.push("/dashboard"); // or /profile
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || err?.error || "Transaction failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <Skeleton width="400px" height="50px" style={{ marginBottom: "3rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3rem" }}>
          <div>
            <Skeleton height="300px" borderRadius="16px" style={{ marginBottom: "2rem" }} />
            <Skeleton height="200px" borderRadius="16px" />
          </div>
          <div>
            <Skeleton height="400px" borderRadius="16px" />
          </div>
        </div>
      </div>
    );
  }
  if (!cart) return null;

  const subtotal = cart?.subtotal || 0;
  const discount = cart?.discountAmount || 0;
  const total = cart?.total || 0;

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "3rem",
        }}
      >
        <ShieldCheck size={32} color="var(--primary-color)" />
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>SECURE CHECKOUT</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "3rem",
        }}
      >
        {/* Left: Shipping Details */}
        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          <h3
            style={{
              fontSize: "1.5rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Truck size={20} color="var(--primary-color)" /> 01. DELIVERY
            COORDINATES
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                STREET ADDRESS
              </label>
              <input
                type="text"
                className="input-field"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Neo-Tokyo, Sector 7..."
                aria-label="Street Address"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  CITY / HABITAT
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cyber City"
                  aria-label="City"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  ZIP / SECTOR CODE
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="10001"
                  aria-label="Zip Code"
                />
              </div>
            </div>
          </div>

          <h3
            style={{
              fontSize: "1.5rem",
              marginTop: "4rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <CreditCard size={20} color="var(--primary-color)" /> 02. PAYMENT
            PROTOCOL
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Stripe Option */}
            <div
              onClick={() => setPaymentMethod("Stripe Simulation")}
              style={{
                padding: "1.5rem",
                border: `1px solid ${paymentMethod === "Stripe Simulation" ? "var(--primary-color)" : "var(--border-color)"}`,
                borderRadius: "12px",
                background:
                  paymentMethod === "Stripe Simulation"
                    ? "rgba(102,252,241,0.05)"
                    : "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `5px solid ${paymentMethod === "Stripe Simulation" ? "var(--primary-color)" : "var(--border-color)"}`,
                }}
              />
              <div>
                <p style={{ fontWeight: 800 }}>
                  Stripe Simulation (Futuristic Edition)
                </p>
                <p
                  style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                >
                  Instant verification, no latency, zero transaction fees.
                </p>
              </div>
            </div>

            {/* Cash Option */}
            <div
              onClick={() => setPaymentMethod("Cash on Delivery")}
              style={{
                padding: "1.5rem",
                border: `1px solid ${paymentMethod === "Cash on Delivery" ? "var(--primary-color)" : "var(--border-color)"}`,
                borderRadius: "12px",
                background:
                  paymentMethod === "Cash on Delivery"
                    ? "rgba(102,252,241,0.05)"
                    : "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `5px solid ${paymentMethod === "Cash on Delivery" ? "var(--primary-color)" : "var(--border-color)"}`,
                }}
              />
              <div>
                <p style={{ fontWeight: 800 }}>
                  Physical Currency (Cash on Delivery)
                </p>
                <p
                  style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                >
                  Pay via secure physical exchange upon safe arrival of goods.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary & Execution */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
              ORDER SUMMARY
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {cart.items.map((item: any) => (
                <div
                  key={item.itemId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {item.quantity}x {item.name}
                  </span>
                  <span>${Number(item.itemTotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                margin: "1.5rem 0",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "var(--success-color)",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Discount Applied</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                <span>Logistic Fees</span>
                <span>FREE</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  marginTop: "1rem",
                }}
              >
                <span>TOTAL</span>
                <span style={{ color: "var(--primary-color)" }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "1.5rem",
                fontSize: "1.25rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {processing ? "EXECUTING..." : "CHECKOUT"}{" "}
              <ArrowRight size={20} />
            </button>
            <p
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
              }}
            >
              By clicking finalize, you agree to the Neural-Transfer Terms of
              Service.
            </p>
          </div>

          <div
            className="glass-panel"
            style={{ padding: "1.5rem", textAlign: "center" }}
          >
            <Link
              href="/cart"
              style={{
                color: "var(--primary-color)",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              ← Return to Matrix Edit Mode
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
