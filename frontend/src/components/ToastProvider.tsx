"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          background: "rgba(0, 0, 0, 0.9)",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        },
        success: {
          duration: 3000,
          style: {
            background: "rgba(16, 185, 129, 0.95)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10b981",
          },
        },
        error: {
          duration: 4000,
          style: {
            background: "rgba(239, 68, 68, 0.95)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#ef4444",
          },
        },
        loading: {
          style: {
            background: "rgba(59, 130, 246, 0.95)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#3b82f6",
          },
        },
      }}
    />
  );
}
