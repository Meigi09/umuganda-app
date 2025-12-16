import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Umuganda - Community Impact Tracking',
  description:
    'A social platform for sharing and tracking community service activities in Rwanda',
  icons: {
    icon: '🌍',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#72b01d" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-lavender-mist text-onyx`}
      >
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <h1 className="text-xl font-bold text-lime-moss">Umuganda</h1>
            </div>
            <ul className="flex gap-6">
              <li>
                <a href="/" className="text-charcoal-blue hover:text-lime-moss transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/compose" className="text-charcoal-blue hover:text-lime-moss transition-colors">
                  Share
                </a>
              </li>
              <li>
                <a href="/analytics" className="text-charcoal-blue hover:text-lime-moss transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <a href="/profile" className="text-charcoal-blue hover:text-lime-moss transition-colors">
                  Profile
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <main className="min-h-screen">{children}</main>

        <footer className="bg-onyx text-lavender-mist py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Umuganda Platform. All rights reserved.</p>
            <p className="mt-2 text-gray-400">
              Empowering communities through transparent impact tracking
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
    
