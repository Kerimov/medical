import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    console.log('Verifying token:', token ? 'present' : 'missing')
    const result = jwt.verify(token, JWT_SECRET) as TokenPayload
    console.log('Token verification successful:', result)
    return result
  } catch (error) {
    console.log('Token verification failed:', error)
    return null
  }
}

