'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Home, Building2, ArrowRight, X } from 'lucide-react'

export default function IntentModal({ onClose }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleDismiss = () => {
    setAnimating(true)
    setTimeout(() => {
      localStorage.setItem('intentModalDone', '1')
      onClose?.()
    }, 250)
  }

  const handleBuy = () => {
    localStorage.setItem('intentModalDone', '1')
    localStorage.setItem('userIntent', 'buyer')
    handleDismiss()
  }

  const handleSell = () => {
    localStorage.setItem('intentModalDone', '1')
    localStorage.setItem('userIntent', 'seller')
    setAnimating(true)
    setTimeout(() => {
      onClose?.('sell')
    }, 250)
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-all duration-250 ${
        visible && !animating ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleDismiss}
    >
      <div
        className={`relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl transition-all duration-250 ${
          visible && !animating
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-full sm:translate-y-4 opacity-0 sm:scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-4 pb-8">
          {/* Header */}
          <div className="mb-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🏡</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              Welcome to MyZameen
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Tell us what you're looking to do — we'll personalise your experience.
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleBuy}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-background hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Home className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-base">Buy Land</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Browse, bid & buy verified plots
                </p>
              </div>
            </button>

            <button
              onClick={handleSell}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-background hover:border-accent hover:bg-accent/5 transition-all duration-200 text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Building2 className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="font-bold text-foreground text-base">Sell Land</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  List your land & reach buyers
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={handleDismiss}
            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
