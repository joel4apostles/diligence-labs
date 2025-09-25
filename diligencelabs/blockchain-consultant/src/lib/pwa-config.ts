// ==================== PWA CONFIGURATION ====================

export const PWA_CONFIG = {
  // Manifest configuration
  manifest: {
    name: "Diligence Labs - Blockchain Consultant",
    short_name: "DiligencelLabs",
    description: "Professional blockchain consulting and advisory services platform",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#3B82F6",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any"
      }
    ],
    shortcuts: [
      {
        name: "Book Consultation",
        short_name: "Book",
        description: "Schedule a new consultation session",
        url: "/dashboard/book-consultation",
        icons: [{ src: "/icons/book-icon.png", sizes: "96x96" }]
      },
      {
        name: "My Dashboard",
        short_name: "Dashboard",
        description: "Access your personal dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/dashboard-icon.png", sizes: "96x96" }]
      }
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-1.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Dashboard Overview"
      },
      {
        src: "/screenshots/mobile-1.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Mobile Dashboard"
      }
    ]
  },

  // Service Worker configuration
  serviceWorker: {
    updateViaCache: 'none' as const,
    skipWaiting: true,
    clientsClaim: true
  },

  // Cache strategies
  cacheStrategies: {
    // Static assets - Cache first
    static: {
      urlPattern: /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },

    // API routes - Network first with cache fallback
    api: {
      urlPattern: /^https:\/\/.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutes
        },
        networkTimeoutSeconds: 10
      }
    },

    // Pages - Stale while revalidate
    pages: {
      urlPattern: /^https:\/\/.*\/(dashboard|auth|admin).*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  }
}

// ==================== PWA INSTALLATION UTILITIES ====================
export class PWAManager {
  private deferredPrompt: any = null
  private isInstalled = false

  constructor() {
    this.init()
  }

  private init() {
    if (typeof window === 'undefined') return

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
    })

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      this.deferredPrompt = null
    })

    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true
    }
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        this.isInstalled = true
        this.deferredPrompt = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('PWA installation failed:', error)
      return false
    }
  }

  canInstall(): boolean {
    return !this.isInstalled && !!this.deferredPrompt
  }

  isAppInstalled(): boolean {
    return this.isInstalled
  }

  // Share API support
  async shareContent(data: { title: string; text: string; url: string }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('Sharing failed:', error)
        return false
      }
    }
    
    // Fallback to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(data.url)
        return true
      } catch (error) {
        console.error('Clipboard write failed:', error)
        return false
      }
    }
    
    return false
  }
}

// ==================== OFFLINE DETECTION ====================
export class OfflineManager {
  private callbacks: Set<(isOnline: boolean) => void> = new Set()
  private isOnline = true

  constructor() {
    this.init()
  }

  private init() {
    if (typeof window === 'undefined') return

    this.isOnline = navigator.onLine

    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyCallbacks()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyCallbacks()
    })
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.isOnline))
  }

  subscribe(callback: (isOnline: boolean) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  getStatus(): boolean {
    return this.isOnline
  }
}

// ==================== PUSH NOTIFICATIONS ====================
export class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null

  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error('Service worker registration failed:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered')
    }

    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      })

      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission denied')
    }

    if (this.registration) {
      await this.registration.showNotification(title, {
        badge: '/icons/badge-icon.png',
        icon: '/icons/icon-192x192.png',
        ...options
      })
    } else {
      new Notification(title, options)
    }
  }
}

// ==================== BACKGROUND SYNC ====================
export class BackgroundSyncManager {
  private registration: ServiceWorkerRegistration | null = null
  private queue: Array<{ id: string; data: any; endpoint: string }> = []

  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error('Background sync initialization failed:', error)
      return false
    }
  }

  async scheduleSync(tag: string, data?: any): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      await this.registration.sync.register(tag)
      
      // Store data for sync
      if (data) {
        localStorage.setItem(`sync-${tag}`, JSON.stringify(data))
      }
      
      return true
    } catch (error) {
      console.error('Background sync registration failed:', error)
      return false
    }
  }

  // Queue API calls for when online
  queueApiCall(endpoint: string, data: any): void {
    const id = Math.random().toString(36).substr(2, 9)
    this.queue.push({ id, data, endpoint })
    localStorage.setItem('api-queue', JSON.stringify(this.queue))
  }

  async processQueue(): Promise<void> {
    const savedQueue = localStorage.getItem('api-queue')
    if (savedQueue) {
      this.queue = JSON.parse(savedQueue)
    }

    for (const item of this.queue) {
      try {
        await fetch(item.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        })
        
        // Remove from queue on success
        this.queue = this.queue.filter(q => q.id !== item.id)
      } catch (error) {
        console.error('Failed to process queued API call:', error)
      }
    }

    localStorage.setItem('api-queue', JSON.stringify(this.queue))
  }
}

// ==================== APP UPDATE MANAGER ====================
export class AppUpdateManager {
  private registration: ServiceWorkerRegistration | null = null
  private updateAvailable = false
  private callbacks: Set<() => void> = new Set()

  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      
      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true
              this.notifyCallbacks()
            }
          })
        }
      })

      return true
    } catch (error) {
      console.error('App update manager initialization failed:', error)
      return false
    }
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback())
  }

  onUpdateAvailable(callback: () => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) {
      return
    }

    const waiting = this.registration.waiting
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }
}

// ==================== SINGLETON INSTANCES ====================
export const pwaManager = new PWAManager()
export const offlineManager = new OfflineManager()
export const notificationManager = new NotificationManager()
export const backgroundSyncManager = new BackgroundSyncManager()
export const appUpdateManager = new AppUpdateManager()

// Initialize all managers
if (typeof window !== 'undefined') {
  Promise.all([
    notificationManager.init(),
    backgroundSyncManager.init(),
    appUpdateManager.init()
  ]).catch(console.error)
}