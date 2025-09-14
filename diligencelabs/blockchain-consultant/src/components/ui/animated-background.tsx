"use client"

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const createParticles = () => {
      const newParticles: Particle[] = []
      
      // Use seeded random for consistent initial positions
      let seed = 54321
      const seededRandom = () => {
        const x = Math.sin(seed++) * 10000
        return x - Math.floor(x)
      }
      
      const width = typeof window !== 'undefined' ? window.innerWidth : 1920
      const height = typeof window !== 'undefined' ? window.innerHeight : 1080
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: seededRandom() * width,
          y: seededRandom() * height,
          size: seededRandom() * 3 + 1,
          speedX: (seededRandom() - 0.5) * 0.5,
          speedY: (seededRandom() - 0.5) * 0.5,
          opacity: seededRandom() * 0.3 + 0.1,
        })
      }
      setParticles(newParticles)
    }

    createParticles()

    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX
          let newY = particle.y + particle.speedY

          // Bounce off edges
          const width = typeof window !== 'undefined' ? window.innerWidth : 1920
          const height = typeof window !== 'undefined' ? window.innerHeight : 1080
          
          if (newX <= 0 || newX >= width) {
            particle.speedX *= -1
            newX = particle.x + particle.speedX
          }
          if (newY <= 0 || newY >= height) {
            particle.speedY *= -1
            newY = particle.y + particle.speedY
          }

          return {
            ...particle,
            x: newX,
            y: newY,
          }
        })
      )
    }

    const interval = setInterval(animateParticles, 50)
    
    const handleResize = () => {
      createParticles()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // Only render on client to prevent hydration mismatch
  if (!isClient) {
    return <div className="fixed inset-0 pointer-events-none overflow-hidden"></div>
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, ${particle.opacity})`,
          }}
        />
      ))}
    </div>
  )
}

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="absolute top-1/4 left-1/6 w-4 h-4 border border-blue-500/30 rotate-45 animate-float" />
      <div className="absolute top-1/3 right-1/5 w-6 h-6 border border-purple-500/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-cyan-500/20 rotate-12 animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-1/3 right-1/3 w-5 h-5 border border-pink-500/30 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Additional floating elements */}
      <div className="absolute top-1/2 left-1/12 w-2 h-2 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-full animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-3/4 right-1/6 w-8 h-1 bg-gradient-to-r from-cyan-500/20 to-transparent animate-float" style={{ animationDelay: '5s' }} />
    </div>
  )
}