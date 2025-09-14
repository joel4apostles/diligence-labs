"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken')
    
    if (token) {
      // If logged in, redirect to dashboard
      router.push('/admin/dashboard')
    } else {
      // If not logged in, redirect to login
      router.push('/admin/auth/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  )
}