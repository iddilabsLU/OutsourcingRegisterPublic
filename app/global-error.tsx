"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F9FAFB",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              width: "100%",
              backgroundColor: "white",
              borderRadius: "0.625rem",
              boxShadow: "0 1px 3px 0px rgba(0, 0, 0, 0.1)",
              padding: "2rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  backgroundColor: "#FEE2E2",
                  borderRadius: "9999px",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <AlertCircle
                  style={{ width: "2rem", height: "2rem", color: "#D92D20" }}
                />
              </div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#1C1C1C",
                  marginBottom: "0.5rem",
                }}
              >
                Application Error
              </h1>
              <p style={{ color: "#6B6F76", marginBottom: "1.5rem" }}>
                A critical error occurred. Please try refreshing the page.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => reset()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#2D3E50",
                    color: "white",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  <RefreshCw style={{ width: "1rem", height: "1rem" }} />
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "white",
                    color: "#2D3E50",
                    borderRadius: "0.375rem",
                    border: "1px solid #E7E5E0",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  Go Home
                </button>
              </div>
              {error.digest && (
                <p
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.75rem",
                    color: "#6B6F76",
                  }}
                >
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
