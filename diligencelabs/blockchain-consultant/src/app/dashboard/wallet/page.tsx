"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Wallet, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CreditCard,
  Lock
} from "lucide-react"

interface WalletConnection {
  id: string
  address: string
  type: string
  connected: boolean
  balance?: string
  network?: string
}

export default function WalletManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { ready, authenticated, user, logout, connectWallet } = usePrivy()
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [connectedWallets, setConnectedWallets] = useState<WalletConnection[]>([])
  const [showAddresses, setShowAddresses] = useState<Record<string, boolean>>({})
  const [copying, setCopying] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/unified-signin')
      return
    }

    setIsPageLoaded(true)
    
    // Mock wallet data - in production, this would come from your API
    if (ready && authenticated && user?.wallet?.address) {
      setConnectedWallets([{
        id: 'primary',
        address: user.wallet.address,
        type: 'MetaMask',
        connected: true,
        balance: '1.25 ETH',
        network: 'Ethereum'
      }])
    }
  }, [session, status, ready, authenticated, user, router])

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleDisconnectWallet = async (walletId: string) => {
    try {
      if (walletId === 'primary') {
        await logout()
        // Remove from connected wallets
        setConnectedWallets(prev => prev.filter(w => w.id !== walletId))
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const copyAddress = async (address: string) => {
    setCopying(address)
    try {
      await navigator.clipboard.writeText(address)
      setTimeout(() => setCopying(null), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
      setCopying(null)
    }
  }

  const toggleAddressVisibility = (walletId: string) => {
    setShowAddresses(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }))
  }

  const truncateAddress = (address: string, show: boolean) => {
    if (show) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8 animate-pulse">
            <div className="h-12 bg-gray-800/50 rounded-lg w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-6 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-light mb-3">
                Wallet <span className="font-normal bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Connect and manage your crypto wallets for seamless payments and Web3 authentication.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleConnectWallet}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>

        {/* Wallet Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Connected Wallets</p>
                  <p className="text-2xl font-bold text-white">{connectedWallets.length}</p>
                </div>
                <Wallet className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Security Status</p>
                  <p className="text-2xl font-bold text-green-400">Active</p>
                </div>
                <Shield className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Networks</p>
                  <p className="text-2xl font-bold text-white">1</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connected Wallets */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Connected Wallets</h2>
          
          {connectedWallets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connectedWallets.map((wallet) => (
                <Card key={wallet.id} className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{wallet.type}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {wallet.network} Network
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${wallet.connected ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {wallet.connected ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Disconnected
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Wallet Address */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">Wallet Address</Label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                        <code className="text-sm text-gray-300 font-mono flex-1">
                          {truncateAddress(wallet.address, showAddresses[wallet.id] || false)}
                        </code>
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={() => toggleAddressVisibility(wallet.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            {showAddresses[wallet.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            onClick={() => copyAddress(wallet.address)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            {copying === wallet.address ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    {wallet.balance && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-300">Balance</Label>
                        <div className="text-lg font-semibold text-white">{wallet.balance}</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                      <Button
                        onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                      <Button
                        onClick={() => handleDisconnectWallet(wallet.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-700">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Wallets Connected</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Connect your crypto wallets to enable Web3 features and seamless blockchain interactions.
                </p>
                <Button 
                  onClick={handleConnectWallet}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Your First Wallet
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Security Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  Transaction Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-300">Multi-signature validation</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-300">Encrypted communication</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-300">Secure key management</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-400" />
                  Privacy Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-300">Address anonymization</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-300">Zero-knowledge proofs</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-300">Private transaction logs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}