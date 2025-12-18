import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/components/providers/auth-provider"
import { LoginOverlay } from "@/components/auth/login-overlay"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "Supplier Outsourcing Register - CSSF Circular 22/806 Demo",
    template: "%s | Supplier Register",
  },
  description:
    "A comprehensive demo showcasing CSSF Circular 22/806 & EBA Outsourcing Guidelines compliance for financial institutions managing Services & Cloud outsourcing arrangements. Includes all mandatory and optional fields with full traceability.",
  keywords: [
    "CSSF",
    "Outsourcing Register",
    "Luxembourg",
    "Financial Compliance",
    "Circular 22/806",
    "Regulatory",
  ],
  authors: [{ name: "Demo Application" }],
  creator: "Demo Application",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoursite.com",
    title: "Supplier Outsourcing Register - CSSF Circular 22/806 Demo",
    description:
      "A comprehensive demo showcasing CSSF Circular 22/806 & EBA Outsourcing Guidelines compliance for financial institutions managing Services & Cloud outsourcing arrangements.",
    siteName: "Supplier Outsourcing Register",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supplier Outsourcing Register - CSSF Circular 22/806 Demo",
    description:
      "A comprehensive demo showcasing CSSF Circular 22/806 & EBA Outsourcing Guidelines compliance for financial institutions.",
    creator: "@yourusername",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <LoginOverlay />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
