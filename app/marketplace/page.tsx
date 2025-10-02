'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, MapPin, Phone, Globe, Clock, Search, Filter } from 'lucide-react'

interface Company {
  id: string
  name: string
  type: string
  description?: string
  address?: string
  city?: string
  phone?: string
  website?: string
  rating?: number
  reviewCount: number
  imageUrl?: string
  services?: string[]
  workingHours?: any
  isVerified: boolean
  products?: Product[]
  _count: {
    products: number
  }
}

interface Product {
  id: string
  name: string
  description?: string
  category?: string
  price?: number
  currency: string
  imageUrl?: string
  tags?: string[]
}

const companyTypes = {
  CLINIC: 'Клиника',
  LABORATORY: 'Лаборатория',
  PHARMACY: 'Аптека',
  HEALTH_STORE: 'Магазин здоровья',
  FITNESS_CENTER: 'Фитнес-центр',
  NUTRITIONIST: 'Диетолог',
  OTHER: 'Другое'
}

export default function MarketplacePage() {
  const { user, token } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedType) params.append('type', selectedType)
      if (selectedCity) params.append('city', selectedCity)

      const response = await fetch(`/api/marketplace/companies?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCompanies()
    }
  }, [token, pagination.page, searchTerm, selectedType, selectedCity])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCompanies()
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'RUB' ? 'RUB' : 'USD'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Маркетплейс</h1>
          <p>Для доступа к маркетплейсу необходимо войти в систему</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Маркетплейс</h1>
        <p className="text-gray-600 mb-6">
          Найдите подходящие клиники, лаборатории, аптеки и магазины здорового питания
        </p>

        {/* Поиск и фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск компаний..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Тип компании" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все типы</SelectItem>
              {Object.entries(companyTypes).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Город"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          />

          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Найти
          </Button>
        </div>
      </div>

      {/* Результаты */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Загрузка...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Компании не найдены</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {companyTypes[company.type as keyof typeof companyTypes]}
                        </Badge>
                        {company.isVerified && (
                          <Badge variant="default" className="bg-green-600">
                            Проверено
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    {company.rating && (
                      <div className="flex items-center gap-1">
                        {renderStars(company.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          ({company.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {company.description && (
                    <p className="text-sm text-gray-600 mb-3">{company.description}</p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {company.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{company.address}, {company.city}</span>
                      </div>
                    )}
                    
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    
                    {company.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Сайт
                        </a>
                      </div>
                    )}
                  </div>

                  {company.services && company.services.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Услуги:</h4>
                      <div className="flex flex-wrap gap-1">
                        {company.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {company.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{company.services.length - 3} еще
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {company.products && company.products.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Товары:</h4>
                      {company.products.slice(0, 2).map((product) => (
                        <div key={product.id} className="flex justify-between items-center text-sm mb-1">
                          <span>{product.name}</span>
                          {product.price && (
                            <span className="font-medium text-green-600">
                              {formatPrice(product.price, product.currency)}
                            </span>
                          )}
                        </div>
                      ))}
                      {company.products.length > 2 && (
                        <p className="text-xs text-gray-500">
                          и еще {company.products.length - 2} товаров
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {company._count.products} товаров
                    </span>
                    <Button size="sm" variant="outline">
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Пагинация */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Назад
              </Button>
              
              <span className="flex items-center px-4">
                Страница {pagination.page} из {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Вперед
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
