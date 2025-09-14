"use client"

import { useEffect, useState } from 'react'

interface ParallaxLayer {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  type: 'circle' | 'square' | 'triangle' | 'hexagon'
  color: string
}

export function ParallaxBackground() {
  const [layers, setLayers] = useState<ParallaxLayer[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const createLayers = () => {
      const newLayers: ParallaxLayer[] = []
      const colors = [
        'rgba(59, 130, 246, 0.1)',
        'rgba(147, 51, 234, 0.1)', 
        'rgba(6, 182, 212, 0.1)',
        'rgba(236, 72, 153, 0.1)',
        'rgba(34, 197, 94, 0.1)'
      ]
      const types: ('circle' | 'square' | 'triangle' | 'hexagon')[] = ['circle', 'square', 'triangle', 'hexagon']
      
      // Use seeded random for consistent initial positions
      let seed = 12345
      const seededRandom = () => {
        const x = Math.sin(seed++) * 10000
        return x - Math.floor(x)
      }
      
      const width = typeof window !== 'undefined' ? window.innerWidth : 1920
      const height = typeof window !== 'undefined' ? window.innerHeight : 1080
      
      for (let i = 0; i < 20; i++) {
        newLayers.push({
          id: i,
          x: seededRandom() * width,
          y: seededRandom() * height,
          size: seededRandom() * 80 + 20,
          speed: (seededRandom() * 2 + 1) * 0.5,
          opacity: seededRandom() * 0.3 + 0.1,
          rotation: seededRandom() * 360,
          type: types[Math.floor(seededRandom() * types.length)],
          color: colors[Math.floor(seededRandom() * colors.length)]
        })
      }
      setLayers(newLayers)
    }

    createLayers()
    
    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window !== 'undefined') {
        setMousePosition({
          x: (e.clientX / window.innerWidth - 0.5) * 100,
          y: (e.clientY / window.innerHeight - 0.5) * 100
        })
      }
    }

    const handleResize = () => {
      createLayers()
    }

    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const scrollY = window.scrollY
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const maxScroll = documentHeight - windowHeight
        const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0
        setScrollPosition(Math.max(0, Math.min(1, scrollProgress)))
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const renderShape = (layer: ParallaxLayer) => {
    // Calculate combined transformation including scroll effects
    const scrollOffsetY = scrollPosition * layer.speed * 100 * (layer.id % 2 === 0 ? 1 : -1)
    const scrollOffsetX = scrollPosition * layer.speed * 50 * (layer.id % 3 === 0 ? 1 : -1)
    const mouseOffsetX = mousePosition.x * layer.speed * 0.1
    const mouseOffsetY = mousePosition.y * layer.speed * 0.1
    const rotationWithScroll = layer.rotation + (scrollPosition * 360 * layer.speed * 0.5)
    
    const baseStyle = {
      position: 'absolute' as const,
      width: layer.size,
      height: layer.size,
      left: layer.x,
      top: layer.y,
      opacity: layer.opacity * (0.5 + 0.5 * Math.cos((scrollPosition || 0) * Math.PI * 2)),
      transform: `rotate(${rotationWithScroll}deg) translate(${mouseOffsetX + scrollOffsetX}px, ${mouseOffsetY + scrollOffsetY}px) scale(${0.8 + 0.4 * Math.sin((scrollPosition || 0) * Math.PI * 4 + layer.id)})`,
      transition: 'transform 0.3s ease-out, opacity 0.5s ease-out',
    }

    switch (layer.type) {
      case 'circle':
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              borderRadius: '50%',
              background: layer.color,
              border: `2px solid ${layer.color.replace('0.1', '0.3')}`
            }}
          />
        )
      case 'square':
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              background: layer.color,
              border: `2px solid ${layer.color.replace('0.1', '0.3')}`
            }}
          />
        )
      case 'triangle':
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              width: 0,
              height: 0,
              borderLeft: `${layer.size/2}px solid transparent`,
              borderRight: `${layer.size/2}px solid transparent`,
              borderBottom: `${layer.size}px solid ${layer.color.replace('0.1', '0.3')}`
            }}
          />
        )
      case 'hexagon':
        return (
          <div
            key={layer.id}
            style={{
              ...baseStyle,
              width: layer.size,
              height: layer.size * 0.866,
              background: layer.color,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              border: `2px solid ${layer.color.replace('0.1', '0.3')}`
            }}
          />
        )
      default:
        return null
    }
  }

  // Only render on client to prevent hydration mismatch
  if (!isClient) {
    return <div className="fixed inset-0 pointer-events-none overflow-hidden"></div>
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {layers.map(renderShape)}
      
      {/* Dynamic gradient orbs with scroll effects */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl"
        style={{
          top: '20%',
          left: '10%',
          transform: `translate(${mousePosition.x * 0.02 + scrollPosition * 100}px, ${mousePosition.y * 0.02 + scrollPosition * 150}px) rotate(${scrollPosition * 180}deg)`,
          opacity: 0.3 + 0.4 * Math.sin((scrollPosition || 0) * Math.PI * 3),
          transition: 'transform 0.5s ease-out, opacity 0.3s ease-out'
        }}
      />
      <div 
        className="absolute w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full filter blur-3xl"
        style={{
          bottom: '20%',
          right: '10%',
          transform: `translate(${-mousePosition.x * 0.03 - scrollPosition * 120}px, ${-mousePosition.y * 0.03 + scrollPosition * 80}px) rotate(${-scrollPosition * 200}deg)`,
          opacity: 0.2 + 0.5 * Math.cos((scrollPosition || 0) * Math.PI * 2.5),
          transition: 'transform 0.5s ease-out, opacity 0.3s ease-out'
        }}
      />
      <div 
        className="absolute w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full filter blur-3xl"
        style={{
          top: '60%',
          left: '60%',
          transform: `translate(${mousePosition.x * 0.025 + (scrollPosition || 0) * 200}px, ${mousePosition.y * 0.025 - (scrollPosition || 0) * 100}px) rotate(${(scrollPosition || 0) * 360}deg) scale(${0.7 + 0.6 * Math.sin((scrollPosition || 0) * Math.PI * 4)})`,
          opacity: 0.25 + 0.35 * Math.sin((scrollPosition || 0) * Math.PI * 1.8 + Math.PI),
          transition: 'transform 0.5s ease-out, opacity 0.3s ease-out'
        }}
      />
      
      {/* Additional animated elements for enhanced scroll effects */}
      <div 
        className="absolute w-48 h-48 bg-gradient-to-r from-violet-500/8 to-purple-500/8 rounded-full filter blur-2xl"
        style={{
          top: '40%',
          left: '80%',
          transform: `translate(${mousePosition.x * 0.015 - scrollPosition * 80}px, ${mousePosition.y * 0.015 + scrollPosition * 200}px) rotate(${scrollPosition * 270}deg)`,
          opacity: 0.15 + 0.3 * Math.cos((scrollPosition || 0) * Math.PI * 1.5),
          transition: 'transform 0.6s ease-out, opacity 0.4s ease-out'
        }}
      />
      <div 
        className="absolute w-72 h-72 bg-gradient-to-r from-indigo-500/8 to-blue-500/8 rounded-full filter blur-3xl"
        style={{
          top: '80%',
          left: '20%',
          transform: `translate(${mousePosition.x * 0.035 + scrollPosition * 150}px, ${mousePosition.y * 0.035 - scrollPosition * 300}px) rotate(${-scrollPosition * 120}deg)`,
          opacity: 0.2 + 0.4 * Math.sin((scrollPosition || 0) * Math.PI * 2.2),
          transition: 'transform 0.4s ease-out, opacity 0.35s ease-out'
        }}
      />
    </div>
  )
}