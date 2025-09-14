"use client"

interface DynamicPageBackgroundProps {
  variant?: 'default' | 'admin' | 'auth' | 'dashboard'
  opacity?: number
}

export function DynamicPageBackground({ variant = 'default', opacity = 0.3 }: DynamicPageBackgroundProps) {
  // Ensure opacity is always a valid number to prevent CSS NaN errors
  const safeOpacity = typeof opacity === 'number' && !isNaN(opacity) ? opacity : 0.3
  const getVariantColors = () => {
    switch (variant) {
      case 'admin':
        return {
          outerGradient: 'from-orange-500/20 via-red-500/20 to-orange-500/20',
          innerGradient: 'from-orange-400/15 via-red-400/15 to-orange-400/15',
          particles: ['bg-orange-400/50', 'bg-red-400/50', 'bg-orange-300/50', 'bg-red-300/50'],
          networkGradients: {
            gradient1: {
              start: 'rgb(249, 115, 22)', // orange-500
              end: 'rgb(239, 68, 68)'     // red-500
            },
            gradient2: {
              start: 'rgb(234, 88, 12)', // orange-600  
              end: 'rgb(220, 38, 38)'    // red-600
            }
          }
        }
      case 'auth':
        return {
          outerGradient: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
          innerGradient: 'from-blue-400/15 via-cyan-400/15 to-blue-400/15',
          particles: ['bg-blue-400/50', 'bg-cyan-400/50', 'bg-blue-300/50', 'bg-cyan-300/50'],
          networkGradients: {
            gradient1: {
              start: 'rgb(59, 130, 246)', // blue-500
              end: 'rgb(6, 182, 212)'     // cyan-500
            },
            gradient2: {
              start: 'rgb(37, 99, 235)',  // blue-600
              end: 'rgb(8, 145, 178)'     // cyan-600
            }
          }
        }
      case 'dashboard':
        return {
          outerGradient: 'from-purple-500/20 via-pink-500/20 to-purple-500/20',
          innerGradient: 'from-purple-400/15 via-pink-400/15 to-purple-400/15',
          particles: ['bg-purple-400/50', 'bg-pink-400/50', 'bg-purple-300/50', 'bg-pink-300/50'],
          networkGradients: {
            gradient1: {
              start: 'rgb(168, 85, 247)', // purple-500
              end: 'rgb(236, 72, 153)'    // pink-500
            },
            gradient2: {
              start: 'rgb(147, 51, 234)', // purple-600
              end: 'rgb(219, 39, 119)'    // pink-600
            }
          }
        }
      default:
        return {
          outerGradient: 'from-blue-500/20 via-purple-500/20 to-cyan-500/20',
          innerGradient: 'from-blue-400/15 via-purple-400/15 to-pink-400/15',
          particles: ['bg-blue-400/50', 'bg-purple-400/50', 'bg-cyan-400/50', 'bg-pink-400/50'],
          networkGradients: {
            gradient1: {
              start: 'rgb(59, 130, 246)',  // blue-500
              end: 'rgb(168, 85, 247)'     // purple-500
            },
            gradient2: {
              start: 'rgb(6, 182, 212)',   // cyan-500
              end: 'rgb(236, 72, 153)'     // pink-500
            }
          }
        }
    }
  }

  const colors = getVariantColors()

  return (
    <>
      {/* Dynamic Symmetric Page-Wide Grid Border with Animation */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        {/* Animated outer border */}
        <div className="absolute inset-0 m-4 rounded-lg overflow-hidden">
          <div className={`absolute inset-0 border-2 border-transparent bg-gradient-to-r ${colors.outerGradient} rounded-lg animate-pulse`} style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'subtract' }} />
          <div className="absolute inset-0 border-2 border-white/5 rounded-lg" />
        </div>
        
        {/* Animated inner border */}
        <div className="absolute inset-0 m-8 rounded-xl overflow-hidden">
          <div className={`absolute inset-0 border border-transparent bg-gradient-to-br ${colors.innerGradient} rounded-xl animate-pulse`} style={{ animationDelay: '1s', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'subtract' }} />
          <div className="absolute inset-0 border border-white/10 rounded-xl" />
        </div>
        
        {/* Dynamic grid pattern with moving effect */}
        <div className="absolute inset-0" style={{ opacity: safeOpacity }}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.015)_1px,transparent_1px)] bg-[size:8rem_8rem] animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Floating grid particles */}
        <div className={`absolute top-1/4 left-1/4 w-1 h-1 ${colors.particles[0]} rounded-full animate-bounce`} style={{ animationDelay: '0.5s' }} />
        <div className={`absolute top-1/3 right-1/4 w-0.5 h-0.5 ${colors.particles[1]} rounded-full animate-bounce`} style={{ animationDelay: '1.5s' }} />
        <div className={`absolute bottom-1/4 left-1/3 w-1.5 h-1.5 ${colors.particles[2]} rounded-full animate-bounce`} style={{ animationDelay: '2.5s' }} />
        <div className={`absolute bottom-1/3 right-1/3 w-1 h-1 ${colors.particles[3]} rounded-full animate-bounce`} style={{ animationDelay: '3.5s' }} />
      </div>

      {/* High-Resolution Animated Abstract Network Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Network nodes */}
        <div className={`absolute top-1/4 left-1/4 w-2 h-2 ${colors.particles[0]} rounded-full animate-pulse`} />
        <div className={`absolute top-1/3 left-1/2 w-1 h-1 ${colors.particles[1]} rounded-full animate-pulse`} style={{ animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/3 w-1.5 h-1.5 ${colors.particles[2]} rounded-full animate-pulse`} style={{ animationDelay: '2s' }} />
        <div className={`absolute bottom-1/4 right-1/4 w-2 h-2 ${colors.particles[0]} rounded-full animate-pulse`} style={{ animationDelay: '3s' }} />
        <div className={`absolute bottom-1/3 right-1/2 w-1 h-1 ${colors.particles[3]} rounded-full animate-pulse`} style={{ animationDelay: '4s' }} />
        
        {/* Network connections */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`networkGradient1-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: colors.networkGradients.gradient1.start, stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: colors.networkGradients.gradient1.end, stopOpacity: 0.1}} />
            </linearGradient>
            <linearGradient id={`networkGradient2-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: colors.networkGradients.gradient2.start, stopOpacity: 0.2}} />
              <stop offset="100%" style={{stopColor: colors.networkGradients.gradient2.end, stopOpacity: 0.1}} />
            </linearGradient>
          </defs>
          <line x1="25%" y1="25%" x2="50%" y2="33%" stroke={`url(#networkGradient1-${variant})`} strokeWidth="1" className="animate-pulse" />
          <line x1="50%" y1="33%" x2="33%" y2="50%" stroke={`url(#networkGradient2-${variant})`} strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <line x1="75%" y1="75%" x2="50%" y2="66%" stroke={`url(#networkGradient1-${variant})`} strokeWidth="1" className="animate-pulse" style={{ animationDelay: '2s' }} />
          <line x1="33%" y1="50%" x2="75%" y2="75%" stroke={`url(#networkGradient2-${variant})`} strokeWidth="1" className="animate-pulse" style={{ animationDelay: '3s' }} />
          <line x1="25%" y1="75%" x2="75%" y2="25%" stroke={`url(#networkGradient1-${variant})`} strokeWidth="0.5" className="animate-pulse" style={{ animationDelay: '4s' }} />
          <line x1="10%" y1="50%" x2="90%" y2="50%" stroke={`url(#networkGradient2-${variant})`} strokeWidth="0.5" className="animate-pulse" style={{ animationDelay: '5s' }} />
        </svg>
      </div>

      {/* Dynamic Background Elements with reduced opacity for grid visibility */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/4 to-purple-500/4 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/4 to-pink-500/4 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-emerald-500/3 to-teal-500/3 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
    </>
  )
}