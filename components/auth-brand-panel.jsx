import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'
import { BadgeCheck, Gavel, IndianRupee } from 'lucide-react'

const POINTS = [
  { icon: BadgeCheck, title: 'Verified listings only', desc: 'Khasra, Jamabandi and registry checked before a plot goes live.' },
  { icon: Gavel, title: 'Transparent bidding', desc: 'See every offer and negotiate directly with the owner.' },
  { icon: IndianRupee, title: 'Zero brokerage', desc: 'No commission on either side of the deal.' },
]

/**
 * Left-hand marketing panel for the auth screens. Desktop only — on phones the
 * form takes the full width and this is hidden.
 */
export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-primary text-primary-foreground p-12">
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -left-20 -bottom-32 w-80 h-80 rounded-full bg-white/5" aria-hidden="true" />

      {/* On the blue panel the wordmark's navy text would disappear, so the
          text is markup tinted to the panel foreground */}
      <Link href="/" className="relative w-fit">
        <BrandLogo className="h-14" onColor />
      </Link>

      <div className="relative">
        <h2 className="text-4xl font-bold leading-tight max-w-md">
          India&apos;s trusted marketplace for land.
        </h2>
        <p className="text-primary-foreground/75 mt-4 max-w-md leading-relaxed">
          Buy and sell plots with verified paperwork, open bidding and no middlemen.
        </p>

        <ul className="mt-10 space-y-6 max-w-md">
          {POINTS.map((point) => (
            <li key={point.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <point.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{point.title}</p>
                <p className="text-sm text-primary-foreground/70 mt-0.5 leading-relaxed">{point.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex gap-10">
        {[
          { value: '2,450+', label: 'Properties listed' },
          { value: '15K+', label: 'Active users' },
          { value: '98%', label: 'Verified' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-primary-foreground/70 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
