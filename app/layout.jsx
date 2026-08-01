import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import BottomNav from '@/components/bottom-nav'
import MobileHeader from '@/components/mobile-header'
import DesktopHeader from '@/components/desktop-header'
import SiteFooter from '@/components/site-footer'
import QueryWidget from '@/components/query-widget'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/lib/i18n'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'LandBid | Digital Land Marketplace',
  description: 'Buy, sell, and bid on verified land properties across India. Transparent bidding, verified documents, and secure transactions.',
  keywords: 'land marketplace, property bidding, real estate, land auction, digital property, agricultural land, india',
  metadataBase: new URL('https://landbid.in'),
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'LandBid | Digital Land Marketplace',
    description: 'Buy, sell and bid on verified land across India — villages, tehsils and growing towns.',
    url: 'https://landbid.in',
    siteName: 'LandBid',
    images: ['/landbid-logo-full.png'],
    locale: 'en_IN',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#171d2d' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <AuthProvider>
              <MobileHeader />
              <DesktopHeader />
              <main className="pb-20 md:pb-0 min-h-screen">
                {children}
              </main>
              <SiteFooter />
              <BottomNav />
              <QueryWidget />
              <Toaster position="top-center" richColors />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
