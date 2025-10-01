// Временное хранилище пользователей (в памяти)
// В продакшене заменить на настоящую базу данных (PostgreSQL + Prisma)

export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

// Глобальное хранилище для сохранения данных между hot reloads
const globalForDb = globalThis as unknown as {
  users: User[] | undefined
}

// Используем глобальное хранилище, которое не очищается при hot reload
const users = globalForDb.users ?? []
globalForDb.users = users

console.log(`[DB] Initialized with ${users.length} users`)

export const db = {
  users: {
    findByEmail: (email: string): User | undefined => {
      return users.find(user => user.email === email)
    },
    
    findById: (id: string): User | undefined => {
      return users.find(user => user.id === id)
    },
    
    create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
      const user: User = {
        id: Math.random().toString(36).substring(2, 15),
        ...userData,
        createdAt: new Date()
      }
      users.push(user)
      globalForDb.users = users // Обновляем глобальное хранилище
      console.log(`[DB] User created: ${user.email}. Total: ${users.length}`)
      return user
    },
    
    getAll: (): User[] => {
      return users
    },
    
    clear: (): void => {
      users.length = 0
      globalForDb.users = users
      console.log('[DB] Database cleared')
    }
  }
}

