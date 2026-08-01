import Image from 'next/image'

/**
 * The LandBid logo.
 *
 * Assets are generated from public/landbid-logo-1.png with the white paper
 * background knocked out. Two ink variants exist because the wordmark is navy:
 * the original for light surfaces and a lightened one for dark mode.
 *
 *  - default : the complete lockup — pin + "LandBid" + "Real Estate Digital
 *              Marketplace"
 *  - `mark`  : the pin alone, square — favicons and very tight spaces
 *
 * Pass `onColor` on the blue auth panel, where the navy ink needs a white card
 * behind it to stay legible.
 */

const LOCKUP = { width: 1420, height: 408 }

export default function BrandLogo({ className = '', priority = false, onColor = false }) {
  const logo = (
    <>
      <Image
        src="/landbid-logo-full.png"
        alt="LandBid — Real Estate Digital Marketplace"
        width={LOCKUP.width}
        height={LOCKUP.height}
        priority={priority}
        className={`w-auto object-contain ${onColor ? '' : 'dark:hidden'} ${className}`}
      />
      {!onColor && (
        <Image
          src="/landbid-logo-full-dark.png"
          alt="LandBid — Real Estate Digital Marketplace"
          width={LOCKUP.width}
          height={LOCKUP.height}
          priority={priority}
          className={`w-auto object-contain hidden dark:block ${className}`}
        />
      )}
    </>
  )

  if (!onColor) return logo

  return (
    <span className="inline-flex items-center rounded-2xl bg-white px-4 py-3">
      {logo}
    </span>
  )
}

/** Square pin mark — used where the full lockup will not fit. */
export function BrandMark({ className = '', priority = false }) {
  return (
    <Image
      src="/landbid-mark.png"
      alt="LandBid"
      width={512}
      height={512}
      priority={priority}
      className={`object-contain ${className}`}
    />
  )
}
