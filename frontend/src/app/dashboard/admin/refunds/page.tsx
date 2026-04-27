"use client";

import { fetchApi } from "@/utils/api";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function AdminRefundsPage() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApi("/refund/get-all-refunds");
        setRefunds(Array.isArray(res) ? res : res.data || []);
      } catch (err: any) {
        if (err.message?.includes("401") || err.message?.includes("403"))
          router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleAction = async (
    refundId: string,
    action: "APPROVE" | "REJECT",
  ) => {
    const result = await Swal.fire({
      title: `${action} REFUND?`,
      text: `Are you sure you want to ${action.toLowerCase()} this transaction protocol?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `CONFIRM ${action}`,
      cancelButtonText: 'ABORT',
      confirmButtonColor: action === 'APPROVE' ? 'var(--success-color)' : 'var(--error-color)',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      customClass: {
        popup: 'glass-panel'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const status = action === "APPROVE" ? "SUCCEEDED" : "FAILED";
      await fetchApi(`/refund/update-status/${refundId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setRefunds(
        refunds.map((r) => (r.id === refundId ? { ...r, status } : r)),
      );
      Swal.fire({
        icon: 'success',
        title: 'PROTOCOL UPDATED',
        text: `Refund has been ${action.toLowerCase()}d.`,
        confirmButtonColor: 'var(--primary-color)',
        customClass: {
          popup: 'glass-panel'
        }
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'UPDATE FAILED',
        text: err.message || "Action failed",
        confirmButtonColor: 'var(--error-color)',
        customClass: {
          popup: 'glass-panel'
        }
      });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      SUCCEEDED: { color: "var(--success-color)", icon: CheckCircle },
      FAILED: { color: "var(--error-color)", icon: XCircle },
      PENDING: { color: "#ffcc00", icon: Clock },
    };
    const cfg = map[status] || map.PENDING;
    const Icon = cfg.icon;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: cfg.color,
          fontWeight: 700,
          fontSize: "0.85rem",
        }}
      >
        <Icon size={14} /> {status}
      </span>
    );
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
          Refund Processing
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Review and action incoming refund requests
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
          Loading refund protocols...
        </div>
      ) : refunds.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          No refund requests pending.
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {refunds.map((r) => (
            <div
              key={r.id}
              className="glass-panel"
              style={{
                padding: "2rem",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "2rem",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      color: "var(--primary-color)",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    Order #{r.orderId?.split("-")[0].toUpperCase()}
                  </p>
                  {statusBadge(r.status)}
                </div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                  }}
                >
                  <strong style={{ color: "var(--primary-color)" }}>User:</strong>{" "}
                  {r.order?.user?.name || "Anonymous"} ({r.order?.user?.email}) ·
                  Submitted:{" "}
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                </p>

                <div 
                  style={{ 
                    background: "rgba(0,0,0,0.2)", 
                    padding: "1rem", 
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    marginBottom: "1rem"
                  }}
                >
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                    Order Manifest (${r.order?.total})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {r.order?.items?.map((item: any, idx: number) => (
                      <p key={idx} style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        <span style={{ color: "var(--primary-color)" }}>{item.quantity}x</span> {item.product?.name}
                      </p>
                    ))}
                  </div>
                </div>

                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong style={{ color: "var(--error-color)" }}>
                    Reason:
                  </strong>{" "}
                  {r.reason}
                </p>
              </div>
              {r.status === "PENDING" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    minWidth: "140px",
                  }}
                >
                  <button
                    onClick={() => handleAction(r.id, "APPROVE")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      background: "rgba(0,230,118,0.1)",
                      border: "1px solid var(--success-color)",
                      color: "var(--success-color)",
                      borderRadius: "8px",
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      transition: "all 0.2s",
                    }}
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(r.id, "REJECT")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      background: "rgba(255,75,75,0.1)",
                      border: "1px solid var(--error-color)",
                      color: "var(--error-color)",
                      borderRadius: "8px",
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      transition: "all 0.2s",
                    }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
