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
}

export const BlockchainNetworkViz: React.FC<{
  className?: string
  interactive?: boolean
}> = ({ className = '', interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Generate network nodes
  useEffect(() => {
    const generateNodes = (): NetworkNode[] => {
      const nodeTypes: NetworkNode['type'][] = ['user', 'consultant', 'expert']
      const newNodes: NetworkNode[] = []
      
      for (let i = 0; i < 25; i++) {
        const node: NetworkNode = {
          id: `node-${i}`,
          x: Math.random() * 800,
          y: Math.random() * 600,
          connections: [],
          type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
          activity: Math.random()
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
          return distance < 150 && Math.random() > 0.6
        })
        node.connections = nearbyNodes.slice(0, 3).map(n => n.id)
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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      nodes.forEach(node => {
        node.connections.forEach(connectionId => {
          const connectedNode = nodes.find(n => n.id === connectionId)
          if (!connectedNode) return

          const gradient = ctx.createLinearGradient(
            node.x, node.y, connectedNode.x, connectedNode.y
          )
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
          gradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)')

          ctx.strokeStyle = gradient
          ctx.lineWidth = 1
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connectedNode.x, connectedNode.y)
          ctx.stroke()
        })
      })

      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id
        const baseSize = 4
        const size = isHovered ? baseSize * 1.5 : baseSize
        
        // Node colors based on type
        const colors = {
          user: '#3B82F6',      // Blue
          consultant: '#F59E0B', // Orange
          expert: '#8B5CF6'     // Purple
        }

        // Outer glow for activity
        if (node.activity > 0.7) {
          ctx.shadowColor = colors[node.type]
          ctx.shadowBlur = 15
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = colors[node.type]
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2)
        ctx.fill()

        // Inner core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(node.x, node.y, size * 0.4, 0, Math.PI * 2)
        ctx.fill()

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

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />

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
              Connecting expertise with innovation through a decentralized network of 
              blockchain professionals, delivering transparent and verifiable consulting services.
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
              { label: 'Active Consultants', value: '1,247' },
              { label: 'Projects Completed', value: '3,891' },
              { label: 'Total Value Secured', value: '$2.4B' },
              { label: 'Success Rate', value: '97.8%' }
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