import { Header } from "./header"
import { Footer } from "./footer"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-8 py-8">{children}</main>
      <Footer />
    </div>
  )
}
