"use client"

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ==================== BLOCKCHAIN NETWORK VISUALIZATION ====================
interface NetworkNode {
  id: string
  x: number
  y: number
  connections: string[]
  type: 'user' | 'consultant' | 'expert'
  activity: number
  vx?: number
  vy?: number
  pulse?: number
}

export const BlockchainNetworkViz: React.FC<{
  className?: string
  interactive?: boolean
}> = ({ className = '', interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Generate network nodes with animation properties
  useEffect(() => {
    const generateNodes = (): NetworkNode[] => {
      const nodeTypes: NetworkNode['type'][] = ['user', 'consultant', 'expert']
      const newNodes: NetworkNode[] = []
      
      for (let i = 0; i < 35; i++) {
        const node: NetworkNode = {
          id: `node-${i}`,
          x: Math.random() * 800,
          y: Math.random() * 600,
          connections: [],
          type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
          activity: Math.random(),
          // Add animation properties
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          pulse: Math.random() * Math.PI * 2
        }
        newNodes.push(node)
      }

      // Create connections between nearby nodes
      newNodes.forEach(node => {
        const nearbyNodes = newNodes.filter(other => {
          if (other.id === node.id) return false
          const distance = Math.sqrt(
            Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
          )
          return distance < 120 && Math.random() > 0.7
        })
        node.connections = nearbyNodes.slice(0, 2).map(n => n.id)
      })

      return newNodes
    }

    setNodes(generateNodes())
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrame: number
    let time = 0

    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update node positions with floating animation
      nodes.forEach(node => {
        if (node.vx !== undefined && node.vy !== undefined && node.pulse !== undefined) {
          // Gentle floating motion
          node.x += Math.sin(time + node.pulse) * 0.3
          node.y += Math.cos(time + node.pulse * 1.3) * 0.2
          
          // Boundary checking with smooth wrap-around
          if (node.x < -20) node.x = canvas.width + 20
          if (node.x > canvas.width + 20) node.x = -20
          if (node.y < -20) node.y = canvas.height + 20
          if (node.y > canvas.height + 20) node.y = -20
        }
      })

      // Draw animated connections with pulsing effect
      nodes.forEach(node => {
        node.connections.forEach(connectionId => {
          const connectedNode = nodes.find(n => n.id === connectionId)
          if (!connectedNode) return

          const distance = Math.sqrt(
            Math.pow(node.x - connectedNode.x, 2) + Math.pow(node.y - connectedNode.y, 2)
          )
          
          // Skip connections that are too far apart due to movement
          if (distance > 200) return

          const pulseIntensity = 0.3 + Math.sin(time * 2) * 0.2
          const gradient = ctx.createLinearGradient(
            node.x, node.y, connectedNode.x, connectedNode.y
          )
          gradient.addColorStop(0, `rgba(59, 130, 246, ${pulseIntensity})`)
          gradient.addColorStop(0.5, `rgba(147, 51, 234, ${pulseIntensity * 1.2})`)
          gradient.addColorStop(1, `rgba(251, 146, 60, ${pulseIntensity * 0.8})`)

          ctx.strokeStyle = gradient
          ctx.lineWidth = 1 + Math.sin(time * 3) * 0.5
          
          // Animated dash pattern
          const dashOffset = time * 20
          ctx.setLineDash([8, 4])
          ctx.lineDashOffset = dashOffset
          
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connectedNode.x, connectedNode.y)
          ctx.stroke()
        })
      })

      // Draw nodes with pulsing animations
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id
        const baseSize = 3
        const pulseSize = baseSize + Math.sin(time * 2 + (node.pulse || 0)) * 1
        const size = isHovered ? pulseSize * 1.8 : pulseSize
        
        // Node colors based on type with animation
        const colors = {
          user: '#3B82F6',      // Blue
          consultant: '#F59E0B', // Orange
          expert: '#8B5CF6'     // Purple
        }

        // Animated outer glow
        const glowIntensity = 0.5 + Math.sin(time * 1.5 + (node.pulse || 0)) * 0.3
        if (node.activity > 0.6 || isHovered) {
          ctx.shadowColor = colors[node.type]
          ctx.shadowBlur = 15 + Math.sin(time * 3) * 5
        } else {
          ctx.shadowBlur = 0
        }

        // Main node with pulsing opacity
        const opacity = 0.8 + Math.sin(time + (node.pulse || 0)) * 0.2
        ctx.fillStyle = colors[node.type] + Math.floor(opacity * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fill()

        // Animated inner core
        const coreOpacity = 0.6 + Math.sin(time * 2 + (node.pulse || 0)) * 0.4
        ctx.fillStyle = `rgba(255, 255, 255, ${coreOpacity})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, size * 0.3, 0, Math.PI * 2)
        ctx.fill()

        // Activity ring for highly active nodes
        if (node.activity > 0.8) {
          const ringRadius = size + 8 + Math.sin(time * 4) * 3
          ctx.strokeStyle = colors[node.type] + '40'
          ctx.lineWidth = 2
          ctx.setLineDash([])
          ctx.beginPath()
          ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.shadowBlur = 0
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const hoveredNodeId = nodes.find(node => {
        const distance = Math.sqrt(
          Math.pow(node.x - mouseX, 2) + Math.pow(node.y - mouseY, 2)
        )
        return distance < 10
      })?.id || null

      setHoveredNode(hoveredNodeId)
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [nodes, hoveredNode, interactive])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 text-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-300">Consultants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-300">Experts</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== ENHANCED HERO SECTION ====================
export const WingbitsInspiredHero: React.FC = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const router = useRouter()

  const handleStartConsulting = () => {
    router.push('/guest-booking')
  }

  const handleExploreNetwork = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background network */}
      <motion.div 
        style={{ y: y2, opacity }}
        className="absolute inset-0"
      >
        <BlockchainNetworkViz className="w-full h-full" />
      </motion.div>

      {/* Additional moving background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-orange-400/20 rounded-full"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 120, 0],
              opacity: [0.2, 0.8, 0.3, 0.2],
              scale: [0.5, 1.2, 0.8, 0.5]
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5
            }}
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i * 5)}%`,
            }}
          />
        ))}

        {/* Moving gradient orbs */}
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-32 h-32 rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? '#3B82F6' : 
                i % 3 === 1 ? '#F59E0B' : '#8B5CF6'
              }40 0%, transparent 70%)`,
              left: `${15 + (i * 15)}%`,
              top: `${25 + (i * 10)}%`,
            }}
            animate={{
              x: [0, 200, -100, 0],
              y: [0, -150, 200, 0],
              scale: [0.8, 1.2, 0.9, 0.8],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
          />
        ))}

        {/* Subtle grid animation */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Gradient overlays with subtle animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" 
        animate={{
          opacity: [0.7, 0.5, 0.7]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black"
        animate={{
          opacity: [0.8, 0.6, 0.8]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Content */}
      <motion.div 
        style={{ y: y1 }}
        className="relative z-10 flex items-center justify-center min-h-screen px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-light mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Blockchain
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent">
                Consulting
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Redefined
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              We connect you with experienced blockchain professionals who actually know what they're doing. 
              Get clear, practical advice from consultants who've built successful projects and understand real-world challenges.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartConsulting}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer"
            >
              Start Consulting
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExploreNetwork}
              className="px-8 py-4 border border-white/20 text-white font-medium rounded-lg backdrop-blur-sm hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              Explore Network
            </motion.button>
          </motion.div>

          {/* Stats section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Launch Success', value: 'Zero Failures' },
              { label: 'Expert Network', value: 'Global Reach' },
              { label: 'Response Time', value: '< 24 Hours' },
              { label: 'Client Satisfaction', value: 'Exceptional' }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + (index * 0.1) }}
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ==================== MODULAR FEATURE CARDS ====================
interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  delay?: number
}

export const ModularFeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  gradient,
  delay = 0
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        rotateX: 0 
      } : {}}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -10, 
        rotateX: -5,
        transition: { duration: 0.3 }
      }}
      className="group relative perspective-1000"
    >
      <div className={`
        relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}
        p-8 h-full border border-white/10 backdrop-blur-xl
        transform-gpu transition-all duration-500
        group-hover:shadow-2xl group-hover:border-white/20
      `}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 50%, white 2px, transparent 2px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl">
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
              backgroundSize: '400% 400%'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 mb-6 text-white"
          >
            {icon}
          </motion.div>

          {/* Content */}
          <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-orange-100 transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
            {description}
          </p>

          {/* Hover arrow */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute bottom-6 right-6"
          >
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== PARTNER LOGOS SHOWCASE ====================
export const PartnerShowcase: React.FC = () => {
  const partners = [
    'Ethereum', 'Polygon', 'Chainlink', 'Uniswap', 'Aave', 'Compound',
    'Arbitrum', 'Optimism', 'The Graph', 'Filecoin', 'IPFS', 'Solana'
  ]

  return (
    <section className="py-16 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Trusted by Leading Blockchain Projects
          </h2>
        </motion.div>

        {/* Animated partner grid */}
        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: [0, -100] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex gap-12 items-center"
            style={{ width: 'calc(200% + 48px)' }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner}-${index}`}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0 px-6 py-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <span className="text-gray-300 font-medium whitespace-nowrap">
                  {partner}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ==================== INTERACTIVE DATA POINTS ====================
export const InteractiveDataPoint: React.FC<{
  value: string
  label: string
  change: string
  trend: 'up' | 'down'
  delay?: number
}> = ({ value, label, change, trend, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-xl border border-white/10 backdrop-blur-xl hover:border-orange-500/30 transition-all duration-300 cursor-pointer"
    >
      {/* Glow effect */}
      <motion.div
        animate={{ 
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1.2 : 1
        }}
        className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl blur-xl"
      />

      <div className="relative z-10">
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {value}
        </motion.div>
        
        <div className="text-gray-400 text-sm mb-3">{label}</div>
        
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          <motion.svg
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={trend === 'up' ? "M7 17l10-10M7 7h10v10" : "M17 7l-10 10M17 17H7V7"} 
            />
          </motion.svg>
          {change}
        </div>
      </div>
    </motion.div>
  )
}

// ==================== SECTION TRANSITIONS ====================
export const SectionTransition: React.FC<{
  children: React.ReactNode
  background?: 'gradient' | 'solid' | 'transparent'
}> = ({ children, background = 'transparent' }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-20%" })

  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-gray-900/50 via-black/70 to-gray-900/50',
    solid: 'bg-black/80',
    transparent: 'bg-transparent'
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
      className={`relative py-20 ${backgroundClasses[background]}`}
    >
      {/* Animated border top */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"
      />
      
      {children}
      
      {/* Animated border bottom */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"
      />
    </motion.section>
  )
}