import fs from 'fs'
import path from 'path'

// Temporary file-based storage for admin accounts when database is unavailable
// This persists between Next.js serverless function calls

interface TempAdmin {
  id: string
  email: string
  name: string
  hashedPassword: string
  role: string
  isActive: boolean
  createdAt: Date
}

const TEMP_ADMINS_FILE = path.join(process.cwd(), '.temp-admins.json')

function loadTempAdmins(): Map<string, TempAdmin> {
  try {
    if (fs.existsSync(TEMP_ADMINS_FILE)) {
      const data = fs.readFileSync(TEMP_ADMINS_FILE, 'utf8')
      const parsed = JSON.parse(data)
      return new Map(Object.entries(parsed))
    }
  } catch (error) {
    console.warn('Error loading temp admins:', error)
  }
  return new Map()
}

function saveTempAdmins(admins: Map<string, TempAdmin>): void {
  try {
    const data = Object.fromEntries(admins)
    fs.writeFileSync(TEMP_ADMINS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.warn('Error saving temp admins:', error)
  }
}

export function getTempAdmin(email: string): TempAdmin | undefined {
  const admins = loadTempAdmins()
  return admins.get(email.toLowerCase())
}

export function addTempAdmin(email: string, admin: TempAdmin): void {
  const admins = loadTempAdmins()
  admins.set(email.toLowerCase(), admin)
  saveTempAdmins(admins)
}

export function listTempAdmins(): string[] {
  const admins = loadTempAdmins()
  return Array.from(admins.keys())
}