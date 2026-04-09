import Image from "next/image"
import { cn } from "@/lib/utils"

export type MascotVariant = "standout" | "hero" | "success" | "empty" | "alert" | "ghost-bg" | "avatar"
export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"

const SIZE_MAP: Record<MascotSize, { width: number; height: number; className: string }> = {
  xs:   { width: 32,  height: 32,  className: "w-8 h-8"    },
  sm:   { width: 64,  height: 64,  className: "w-16 h-16"  },
  md:   { width: 120, height: 120, className: "w-30 h-30"  },
  lg:   { width: 200, height: 200, className: "w-50 h-50"  },
  xl:   { width: 320, height: 320, className: "w-80 h-80"  },
  "2xl":{ width: 480, height: 480, className: "w-120 h-120"},
  full: { width: 800, height: 800, className: "w-full h-full" },
}

const VARIANT_SRC: Record<MascotVariant, string> = {
  standout: "/mascot/omni-standout.png",
  hero:     "/mascot/omni-hero.png",
  success:  "/mascot/omni-success.png",
  empty:    "/mascot/omni-empty.png",
  alert:    "/mascot/omni-alert.png",
  "ghost-bg": "/mascot/omni-ghost-bg.png",
  avatar:   "/mascot/omni-avatar.png",
}

interface OmniMascotProps {
  variant?: MascotVariant
  size?: MascotSize
  className?: string
  /** If true, renders as a full-coverage background overlay (absolute positioned) */
  asBackground?: boolean
  /** Opacity when used as background (0–100) */
  bgOpacity?: number
  /** Alt text for the mascot image */
  alt?: string
}

export function OmniMascot({
  variant = "standout",
  size = "md",
  className,
  asBackground = false,
  bgOpacity = 8,
  alt = "Omni — OmniCore mascot",
}: OmniMascotProps) {
  const src = VARIANT_SRC[variant]
  const dim = SIZE_MAP[size]

  if (asBackground) {
    return (
      <div
        className={cn("pointer-events-none select-none absolute inset-0 overflow-hidden", className)}
        style={{ opacity: bgOpacity / 100 }}
        aria-hidden
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-cover object-center"
          priority={false}
          sizes="100vw"
        />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={dim.width}
      height={dim.height}
      className={cn("object-contain", dim.className, className)}
      priority={false}
    />
  )
}

/** Convenience: full-page ghost background — drop inside a relative container */
export function OmniGhostBackground({ opacity = 6 }: { opacity?: number }) {
  return <OmniMascot variant="ghost-bg" asBackground bgOpacity={opacity} />
}

/** Convenience: small avatar for nav/sidebar */
export function OmniAvatar({ size = "xs", className }: { size?: MascotSize; className?: string }) {
  return <OmniMascot variant="avatar" size={size} className={className} />
}
