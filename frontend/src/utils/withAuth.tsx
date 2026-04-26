"use client";

import { isAuthenticated } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        if (isAuthenticated()) {
          setAuthenticated(true);
        } else {
          router.push(
            "/login?redirect=" + encodeURIComponent(window.location.pathname),
          );
        }
        setIsLoading(false);
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <p>Loading...</p>
        </div>
      );
    }

    if (!authenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};
