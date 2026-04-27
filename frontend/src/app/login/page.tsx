"use client";

import { env } from "@/config/env";
import { fetchApi } from "@/utils/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const err = searchParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      router.push("/dashboard");
    }
    if (err) {
      setError(err);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: "code",
      scope: "profile email",
      access_type: "offline",
      prompt: "consent",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <div
        className="glass-panel"
        style={{ width: "100%", maxWidth: "450px", padding: "2.5rem" }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "0.5rem",
            color: "var(--primary-color)",
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
          }}
        >
          Log in to your futuristic cart
        </p>

        {error && (
          <div
            style={{
              background: "rgba(255, 75, 75, 0.1)",
              border: "1px solid var(--error-color)",
              color: "var(--error-color)",
              padding: "0.75rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        <div
          style={{ display: "flex", alignItems: "center", margin: "2rem 0" }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border-color)",
            }}
          ></div>
          <span
            style={{
              padding: "0 1rem",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            Or continue with
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border-color)",
            }}
          ></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn-primary"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          Google
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          Don't have an account?{" "}
          <Link
            href="/register"
            style={{ color: "var(--primary-color)", fontWeight: "600" }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <LoginPageContent />
    </Suspense>
  );
}
