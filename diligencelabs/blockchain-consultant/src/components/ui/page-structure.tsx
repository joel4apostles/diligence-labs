"use client"

import { useEffect, useState } from 'react'

export function PageStructureLines() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Vertical guide lines */}
      <div className="absolute left-8 top-0 bottom-0 w-px">
        <div 
          className={`h-full bg-gradient-to-b from-transparent via-white/10 to-transparent transition-all duration-2000 ${
            isLoaded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
          }`}
          style={{
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.05)'
          }}
        />
      </div>
      
      <div className="absolute right-8 top-0 bottom-0 w-px">
        <div 
          className={`h-full bg-gradient-to-b from-transparent via-white/10 to-transparent transition-all duration-2000 delay-500 ${
            isLoaded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
          }`}
          style={{
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.05)'
          }}
        />
      </div>

      {/* Inner vertical guides */}
      <div className="absolute left-32 top-0 bottom-0 w-px">
        <div 
          className={`h-full bg-gradient-to-b from-transparent via-white/5 to-transparent transition-all duration-2000 delay-1000 ${
            isLoaded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
          }`}
        />
      </div>
      
      <div className="absolute right-32 top-0 bottom-0 w-px">
        <div 
          className={`h-full bg-gradient-to-b from-transparent via-white/5 to-transparent transition-all duration-2000 delay-1000 ${
            isLoaded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
          }`}
        />
      </div>

      {/* Corner accent markers */}
      <div className="absolute top-8 left-8">
        <div className={`w-8 h-8 border-l border-t border-white/20 transition-all duration-1000 delay-1500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`} />
      </div>
      
      <div className="absolute top-8 right-8">
        <div className={`w-8 h-8 border-r border-t border-white/20 transition-all duration-1000 delay-1500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`} />
      </div>
      
      <div className="absolute bottom-8 left-8">
        <div className={`w-8 h-8 border-l border-b border-white/20 transition-all duration-1000 delay-1500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`} />
      </div>
      
      <div className="absolute bottom-8 right-8">
        <div className={`w-8 h-8 border-r border-b border-white/20 transition-all duration-1000 delay-1500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`} />
      </div>

      {/* Center alignment markers */}
      <div className="absolute left-1/2 top-8 transform -translate-x-1/2">
        <div className={`w-4 h-px bg-white/20 transition-all duration-1000 delay-2000 ${
          isLoaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
        }`} />
      </div>
      
      <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2">
        <div className={`w-4 h-px bg-white/20 transition-all duration-1000 delay-2000 ${
          isLoaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
        }`} />
      </div>
    </div>
  )
}