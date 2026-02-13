import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import BottomNav from '@/components/bottom-nav'
import MobileHeader from '@/components/mobile-header'
import { Toaster } from 'sonner'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'LandHub | Digital Land Marketplace',
  description: 'Buy, sell, and bid on verified land properties across India. Transparent bidding, verified documents, and secure transactions.',
  keywords: 'land marketplace, property bidding, real estate, land auction, digital property, agricultural land, india',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#171d2d' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <MobileHeader />
          <main className="pb-20 min-h-screen">
            {children}
          </main>
          <BottomNav />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
