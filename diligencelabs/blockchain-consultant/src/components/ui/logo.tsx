import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  href?: string | null
  height?: number
  width?: number
  showText?: boolean
  size?: 'small' | 'medium' | 'large' | 'xl' | 'lg' | 'sm'
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
    sm: { width: 140, height: 35 },
    medium: { width: 180, height: 45 },
    large: { width: 220, height: 55 },
    lg: { width: 220, height: 55 }, // Map lg to large
    xl: { width: 260, height: 65 }
  }
  
  // Ensure we have a valid size, fallback to medium if not found
  const validSize = sizePresets[size as keyof typeof sizePresets] ? size as keyof typeof sizePresets : 'medium'
  
  const logoSize = {
    width: width ?? sizePresets[validSize].width,
    height: height ?? sizePresets[validSize].height
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

  if (href && href !== null) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}