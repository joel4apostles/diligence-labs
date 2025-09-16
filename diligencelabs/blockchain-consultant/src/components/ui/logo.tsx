import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  href?: string
  height?: number
  width?: number
  showText?: boolean
  size?: 'small' | 'medium' | 'large' | 'xl'
}

export function Logo({ 
  className = "", 
  href = "/", 
  height, 
  width,
  size = 'medium',
  showText = false 
}: LogoProps) {
  // Define size presets for better consistency
  const sizePresets = {
    small: { width: 140, height: 35 },
    medium: { width: 180, height: 45 },
    large: { width: 220, height: 55 },
    xl: { width: 260, height: 65 }
  }
  
  const logoSize = {
    width: width ?? sizePresets[size].width,
    height: height ?? sizePresets[size].height
  }
  const logoElement = (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/diligence-labs-logo.png"
        alt="Diligence Labs"
        width={logoSize.width}
        height={logoSize.height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="ml-2 font-bold text-white">
          Diligence Labs
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}