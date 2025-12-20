import Link from "next/link"
import Image from "next/image"
import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  Home as HomeIcon,
  BookOpen,
  Coffee,
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-slate-800 text-slate-200">
      <div className="container px-4 py-4 md:px-8">
        {/* Three-Column Layout */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Left Column: Branding */}
          <div className="space-y-2">
            <Image
              src="/White Long Resized.png"
              alt="IddiLabs"
              width={60}
              height={15}
              className="h-6 w-auto"
            />
            <div className="text-sm text-slate-400">
              <p>Built with ❤️ in Luxembourg 🇱🇺</p>
              <p className="text-xs">© {currentYear} IddiLabs</p>
            </div>
          </div>

          {/* Middle Column: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="https://www.iddi-labs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <HomeIcon className="h-4 w-4" />
                Website
              </Link>
              <Link
                href="https://www.iddi-labs.com/outsourcingregister/guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Guidelines
              </Link>
              <Link
                href="https://buymeacoffee.com/iddilabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Coffee className="h-4 w-4" />
                Donations
              </Link>
            </nav>
          </div>

          {/* Right Column: Social & Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Connect</h3>
            <div className="flex gap-3">
              <Link
                href="https://www.linkedin.com/company/iddilabs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com/iddilabsLU"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/iddilabs/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
            <Link
              href="mailto:contact@iddi-labs.com"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Mail className="h-4 w-4" />
              contact@iddi-labs.com
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
