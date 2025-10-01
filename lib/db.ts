// Временное хранилище пользователей (в памяти)
// В продакшене заменить на настоящую базу данных (PostgreSQL + Prisma)

export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

// Хранилище пользователей в памяти
const users: User[] = []

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
      return user
    },
    
    getAll: (): User[] => {
      return users
    }
  }
}

