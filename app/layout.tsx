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
    default: "Services and Cloud Outsourcing Register",
    template: "%s | Supplier Register",
  },
  description:
    "Open-source Outsourcing Service and Cloud register in compliance with CSSF Circular 22/806 & EBA Outsourcing Guidelines for financial institutions managing outsourcing arrangements.",
  keywords: [
    "CSSF",
    "Outsourcing Register",
    "Luxembourg",
    "Financial Compliance",
    "Circular 22/806",
    "Regulatory",
  ],
  authors: [{ name: "IddiLabs" }],
  creator: "IddiLabs",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.iddi-labs.com/",
    title: "Services and Cloud Outsourcing Register",
    description:
      "An Outsourcing and Cloud register in compliance with CSSF Circular 22/806 & EBA Outsourcing Guidelines for financial institutions managing Services & Cloud outsourcing arrangements.",
    siteName: "Services and Cloud Outsourcing Register",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services and Cloud Outsourcing Register",
    description:
      "An Outsourcing and Cloud register in compliance with CSSF Circular 22/806 & EBA Outsourcing Guidelines for financial institutions.",
    creator: "IddiLabs",
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
