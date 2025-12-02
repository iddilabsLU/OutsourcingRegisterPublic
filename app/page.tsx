import Link from "next/link"
import { AppLayout } from "@/components/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShieldCheck,
  Code2,
  Database,
  Settings,
  BarChart3,
  ArrowDownUp,
  ArrowRight,
} from "lucide-react"

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="space-y-6 text-center">
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              className="pointer-events-none text-muted-foreground"
            >
              Demo Application
            </Button>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Services & Cloud Outsourcing Register
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              CSSF Circular 22/806 - 25/883 & EBA Outsourcing compliant.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Link href="/suppliers">
              <Button size="lg" className="gap-2">
                View Register
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                CSSF Compliant
              </CardTitle>
              <CardDescription>
                Full compliance with CSSF Circular 22/806 (Section 4.2.7) & EBA Guidelines. The
                Every field is labeled with CSSF 22/806 circular reference for easy reconciliation
                (50+ fields)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                Free and Open-Source
              </CardTitle>
              <CardDescription>
                This Demo will be soon packed into a free and Open-Source software. Your company can
                inspect, modify, change the code and freely install the tool on local premises.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Comprehensive Data
              </CardTitle>
              <CardDescription>
                Demonstrates, critical, non-critical outsourcing and Cloud arrangements with
                realistic dummy data covering all regulatory points.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Customize
              </CardTitle>
              <CardDescription>
                Add, delete, update the outsourcing arrangments. Use filters and explore
                sorting/searching capabilities to find specific suppliers or criteria.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Dashboards
              </CardTitle>
              <CardDescription>
                Explore the dashboards section. Dynamically updated based on the supplier register
                list and its set filters to give you insights on your outsourcing arrangements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownUp className="h-5 w-5 text-primary" />
                Export & Store
              </CardTitle>
              <CardDescription>
                Export and Store the full or filtered supplier register in .xlsx or pdf format.
                Decide between full register or compact view, all outsourcing or filtered ones.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* About Section */}
        <section className="space-y-4 rounded-lg border-2 bg-muted/50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">About This Demo</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              This application is a demo. A full offline free OPEN SOURCE version will be released
              soon. We do not save your data, the changes you make to the supplier register are only
              stored on your browser session storage.
            </p>
            <p>
              The register includes 5 dummy suppliers across different categories (IT
              infrastructure, payment processing, facilities management, etc.), with a mix of
              critical and non-critical functions. You are free to modify the register freely, the
              changes are visible only to you and stored in your browser session storage.
            </p>
            <p>Do not hesitate to reach out for any questions or feedback!</p>
          </div>
        </section>

        {/* About IddiLabs */}
        <section className="space-y-4 rounded-lg border-2 bg-muted/50 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold"> IddiLabs: Why sharing projects for free?</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Welcome to IddiLabs. I&apos;m a Risk Manager based in Luxembourg, and this is my
              personal project. My goal is to explore how AI can empower Subject Matters Experts
              (SMEs) in building their own tools. I believe SMEs are the best suited to create
              solutions that address their specific needs.
            </p>
            <p>
              My focus is on open-source, local solutions. In a privacy-conscious environment like
              Europe, controlling your data is non-negotiable. By making projects open-source and
              deployable on local premises or your own machine, companies can review the code and
              ensure sensitive data remains in-house.
            </p>
            <p>
              I&apos;m not a developer by trade. I&apos;m just a professional who spends an hour
              every day learning and experimenting with AI. I&apos;m convinced this is a critical
              skill for the future, so I&apos;ve decided to share my work publicly, hoping it might
              help others and, in turn, open new doors for my own career.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
