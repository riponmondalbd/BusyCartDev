"use client";

import { fetchApi } from "@/utils/api";
import {
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchApi("/order/my-orders");
        setOrders(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const downloadInvoice = async (orderId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/invoice/generate/${orderId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId.slice(0, 8)}.pdf`;
      a.click();
    } catch (err) {
      toast.error("Failed to download invoice");
    }
  };

  const requestRefund = async (orderId: string) => {
    const reason = prompt("Reason for refund:");
    if (!reason) return;
    try {
      await fetchApi("/refund", {
        method: "POST",
        body: JSON.stringify({ orderId, reason }),
      });
      toast.success("Refund request submitted successfully");
    } catch (err: any) {
      toast.error(err.message || "Refund request failed");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle size={18} color="var(--success-color)" />;
      case "SHIPPED":
        return <Truck size={18} color="var(--primary-color)" />;
      case "CANCELLED":
        return <XCircle size={18} color="var(--error-color)" />;
      case "PROCESSING":
        return <Clock size={18} color="#ffcc00" />;
      default:
        return <Clock size={18} color="var(--text-secondary)" />;
    }
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}
        >
          Order History
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Track your acquisitions and manage digital invoices.
        </p>
      </div>

      {loading ? (
        <div
          className="glass-panel"
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--primary-color)",
          }}
        >
          Retrieving transaction history...
        </div>
      ) : orders.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          No orders found in your database.
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-panel"
              style={{ padding: "2rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Transaction ID
                  </p>
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontFamily: "monospace",
                      color: "var(--primary-color)",
                    }}
                  >
                    #{order.id.split("-")[0].toUpperCase()}
                  </h3>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                    ${order.total}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      justifyContent: "flex-end",
                      marginTop: "0.5rem",
                    }}
                  >
                    {getStatusIcon(order.status)}
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <button
                  onClick={() => downloadInvoice(order.id)}
                  className="btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <Download size={16} /> Download Invoice
                </button>
                {order.status === "DELIVERED" && (
                  <button
                    onClick={() => requestRefund(order.id)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                      borderRadius: "8px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <RefreshCw size={16} /> Request Refund
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
