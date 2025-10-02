'use client'

import Link from 'next/link'
import { Activity, Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline">Персональный Медицинский Ассистент</span>
          <span className="font-bold text-xl sm:hidden">ПМА</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            Главная
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Документы
              </Link>
              <Link href="/analyses" className="transition-colors hover:text-primary">
                Анализы
              </Link>
              <Link href="/reminders" className="transition-colors hover:text-primary">
                Напоминания
              </Link>
              <Link href="/marketplace" className="transition-colors hover:text-primary">
                Маркетплейс
              </Link>
              <Link href="/marketplace/recommendations" className="transition-colors hover:text-primary">
                Рекомендации
              </Link>
            </>
          )}
          <Link href="/features" className="transition-colors hover:text-primary">
            Возможности
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary">
            О нас
          </Link>
          <Link href="/contact" className="transition-colors hover:text-primary">
            Контакты
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block"></div>
          {!isLoading && (
            user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="default">
                    <User className="mr-2 h-4 w-4" />
                    Личный кабинет
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>Выйти</Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden md:inline-flex">
                    Войти
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="hidden md:inline-flex">
                    Регистрация
                  </Button>
                </Link>
              </>
            )
          )}
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container flex flex-col space-y-4 py-4">
            <Link href="/" className="transition-colors hover:text-primary">
              Главная
            </Link>
                {user && (
                  <>
                    <Link href="/dashboard" className="transition-colors hover:text-primary">
                      Документы
                    </Link>
                    <Link href="/analyses" className="transition-colors hover:text-primary">
                      Анализы
                    </Link>
                    <Link href="/reminders" className="transition-colors hover:text-primary">
                      Напоминания
                    </Link>
                    <Link href="/marketplace" className="transition-colors hover:text-primary">
                      Маркетплейс
                    </Link>
                    <Link href="/marketplace/recommendations" className="transition-colors hover:text-primary">
                      Рекомендации
                    </Link>
                  </>
                )}
            <Link href="/features" className="transition-colors hover:text-primary">
              Возможности
            </Link>
            <Link href="/about" className="transition-colors hover:text-primary">
              О нас
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Контакты
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              {!isLoading && (
                user ? (
                  <Link href="/dashboard">
                    <Button className="w-full">Личный кабинет</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full">Войти</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full">Регистрация</Button>
                    </Link>
                  </>
                )
              )}
              {user && (
                <Button variant="outline" className="w-full" onClick={handleLogout}>Выйти</Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

