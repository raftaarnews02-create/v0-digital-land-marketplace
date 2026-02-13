import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'LandHub | Digital Land Marketplace',
  description: 'Buy, sell, and bid on verified land properties with secure transactions and transparent documentation.',
  keywords: 'land marketplace, property bidding, real estate, land auction, digital property',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1f2e' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
