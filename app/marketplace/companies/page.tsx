'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, Phone, Globe, Star, Building2, TestTube, Pill, 
  ShoppingBag, Dumbbell, UtensilsCrossed, Search, CheckCircle2 
} from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  type: string
  description?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  reviewCount: number
  imageUrl?: string
  isVerified: boolean
  workingHours?: any
  coordinates?: any
  products: Array<{
    id: string
    name: string
    price?: number
    currency?: string
  }>
  _count: {
    recommendations: number
    products: number
  }
}

const companyTypes = {
  CLINIC: { label: 'Клиника', icon: Building2, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  LABORATORY: { label: 'Лаборатория', icon: TestTube, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  PHARMACY: { label: 'Аптека', icon: Pill, color: 'bg-green-100 text-green-700 border-green-200' },
  HEALTH_STORE: { label: 'Магазин здорового питания', icon: ShoppingBag, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  FITNESS_CENTER: { label: 'Фитнес-центр', icon: Dumbbell, color: 'bg-red-100 text-red-700 border-red-200' },
  NUTRITIONIST: { label: 'Диетолог', icon: UtensilsCrossed, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  OTHER: { label: 'Другое', icon: Building2, color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (selectedType !== 'all') params.append('type', selectedType)
      if (cityFilter) params.append('city', cityFilter)
      if (searchQuery) params.append('search', searchQuery)
      if (verifiedOnly) params.append('verified', 'true')
      params.append('limit', '20')

      const response = await fetch(`/api/marketplace/companies?${params}`)

      if (!response.ok) {
        throw new Error('Ошибка загрузки компаний')
      }

      const data = await response.json()
      setCompanies(data.companies || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [selectedType, cityFilter, verifiedOnly])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCompanies()
  }

  const formatPrice = (price: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-6 shadow-medical">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Каталог компаний
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Найдите проверенные клиники, лаборатории, аптеки и магазины здорового питания в вашем городе
          </p>
        </div>

        {/* Фильтры */}
        <div className="mb-8">
          <div className="glass-effect rounded-2xl p-6 shadow-medical">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Поиск по названию или описанию..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-0 bg-white/50"
                    />
                  </div>
                </div>
                <Button type="submit" className="gradient-primary text-white hover:opacity-90">
                  Найти
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-64 border-0 bg-white/50">
                    <SelectValue placeholder="Тип компании" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="CLINIC">Клиники</SelectItem>
                    <SelectItem value="LABORATORY">Лаборатории</SelectItem>
                    <SelectItem value="PHARMACY">Аптеки</SelectItem>
                    <SelectItem value="HEALTH_STORE">Магазины здорового питания</SelectItem>
                    <SelectItem value="FITNESS_CENTER">Фитнес-центры</SelectItem>
                    <SelectItem value="NUTRITIONIST">Диетологи</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Город..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="border-0 bg-white/50"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="verified" className="text-sm font-medium">
                    Только проверенные
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Результаты */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Найдено компаний: <span className="font-semibold text-foreground">{total}</span>
          </p>
        </div>

        {/* Список компаний */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка компаний...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Компании не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => {
              const typeInfo = companyTypes[company.type as keyof typeof companyTypes] || companyTypes.OTHER
              const IconComponent = typeInfo.icon

              return (
                <Link key={company.id} href={`/marketplace/companies/${company.id}`}>
                  <Card className="group hover:shadow-medical-lg transition-all duration-300 border-0 shadow-medical glass-effect h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${typeInfo.color} shadow-sm border`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        {company.rating && company.rating > 0 && (
                          <div className="flex items-center gap-1">
                            {renderStars(company.rating)}
                            <span className="text-sm font-medium ml-1">
                              {company.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors flex-1">
                          {company.name}
                        </CardTitle>
                        {company.isVerified && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      <Badge variant="outline" className={`${typeInfo.color} border w-fit mt-2`}>
                        {typeInfo.label}
                      </Badge>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {company.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {company.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm mb-4">
                        {company.address && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {company.address}{company.city && `, ${company.city}`}
                            </span>
                          </div>
                        )}

                        {company.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{company.phone}</span>
                          </div>
                        )}

                        {company.website && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <span className="text-blue-600 hover:underline line-clamp-1">
                              {company.website.replace(/^https?:\/\//, '')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Товары */}
                      {company.products.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-xl border border-blue-100">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Доступно товаров: {company._count.products}
                          </p>
                          <div className="space-y-1">
                            {company.products.slice(0, 2).map((product) => (
                              <div key={product.id} className="flex justify-between items-center text-xs">
                                <span className="text-gray-600 line-clamp-1 flex-1">
                                  {product.name}
                                </span>
                                {product.price && (
                                  <span className="font-semibold text-green-600 ml-2">
                                    {formatPrice(product.price, product.currency)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{company.reviewCount} отзывов</span>
                          <span className="text-blue-600 font-medium group-hover:underline">
                            Подробнее →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
