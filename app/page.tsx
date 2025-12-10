"use client"

import { useEffect } from "react"

export default function HomeRedirect() {
  useEffect(() => {
    // Use relative path so it works with file:// exports
    window.location.replace("./suppliers/")
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold">Redirecting to the Suppliers Register…</p>
        <p className="text-sm text-gray-600">
          If you are not redirected automatically,{" "}
          <a className="text-blue-600 underline" href="./suppliers/">
            click here
          </a>.
        </p>
      </div>
    </div>
  )
}
