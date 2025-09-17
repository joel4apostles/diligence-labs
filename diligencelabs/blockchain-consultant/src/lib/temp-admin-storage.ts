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
    console.log('Loading temp admins from:', TEMP_ADMINS_FILE)
    console.log('File exists:', fs.existsSync(TEMP_ADMINS_FILE))
    if (fs.existsSync(TEMP_ADMINS_FILE)) {
      const data = fs.readFileSync(TEMP_ADMINS_FILE, 'utf8')
      console.log('Raw file data:', data)
      const parsed = JSON.parse(data)
      console.log('Parsed data:', parsed)
      return new Map(Object.entries(parsed))
    }
  } catch (error) {
    console.error('Error loading temp admins:', error)
  }
  console.log('Returning empty map')
  return new Map()
}

function saveTempAdmins(admins: Map<string, TempAdmin>): void {
  try {
    const data = Object.fromEntries(admins)
    console.log('Saving temp admins to file:', TEMP_ADMINS_FILE)
    console.log('Data to save:', data)
    fs.writeFileSync(TEMP_ADMINS_FILE, JSON.stringify(data, null, 2))
    console.log('Successfully saved temp admins file')
  } catch (error) {
    console.error('Error saving temp admins:', error)
  }
}

export function getTempAdmin(email: string): TempAdmin | undefined {
  const admins = loadTempAdmins()
  const admin = admins.get(email.toLowerCase())
  console.log('Looking for temp admin:', email.toLowerCase(), 'Found:', admin ? 'YES' : 'NO')
  console.log('Available temp admins:', Array.from(admins.keys()))
  return admin
}

export function addTempAdmin(email: string, admin: TempAdmin): void {
  const admins = loadTempAdmins()
  admins.set(email.toLowerCase(), admin)
  saveTempAdmins(admins)
  console.log('Stored temp admin:', email.toLowerCase())
  console.log('Current temp admins:', Array.from(admins.keys()))
}

export function listTempAdmins(): string[] {
  const admins = loadTempAdmins()
  return Array.from(admins.keys())
}