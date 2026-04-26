"use client";

import { fetchApi } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApi("/order/all");
        setOrders(Array.isArray(res) ? res : res.data || []);
      } catch (err: any) {
        if (err.message?.includes("401") || err.message?.includes("403"))
          router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetchApi(`/order/update-status/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const statusColor = (s: string) => {
    if (s === "DELIVERED") return "var(--success-color)";
    if (s === "CANCELLED") return "var(--error-color)";
    if (s === "SHIPPED") return "#66b2ff";
    if (s === "PROCESSING") return "#ffcc00";
    return "var(--text-secondary)";
  };

  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          Global Order Matrix
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {orders.length} total system transactions
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
          Synchronizing order data...
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
          No orders found in the system.
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
                    #{order.id?.split("-")[0].toUpperCase()}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    User: {order.user?.name || order.user?.email || "Unknown"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    ${order.total}
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: `1px solid ${statusColor(order.status)}`,
                      color: statusColor(order.status),
                      padding: "0.4rem 0.75rem",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "1rem",
                  }}
                >
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem 0",
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span>
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
