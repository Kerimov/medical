'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  Stethoscope
} from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  email: string
  phone?: string
  recordType: string
  diagnosis?: string
  status: string
  createdAt: string
  updatedAt: string
  nextVisit?: string
}

export default function DoctorPatients() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchPatients()
    }
  }, [user, isLoading, router])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/doctor/patients', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.diagnosis && patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800'
      case 'follow_up': return 'bg-green-100 text-green-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'routine': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Управление пациентами
              </h1>
              <p className="text-gray-600 mt-2">
                Всего пациентов: {patients.length}
              </p>
            </div>
            <Link href="/doctor/patients/new">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Новый пациент
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass-effect border-0 shadow-medical mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по имени, email или диагнозу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="glass-effect border-0 shadow-medical hover:shadow-medical-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription>{patient.email}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4" />
                    <Badge className={getRecordTypeColor(patient.recordType)}>
                      {patient.recordType}
                    </Badge>
                  </div>

                  {patient.diagnosis && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Диагноз:</span>
                      <p className="text-gray-600 mt-1">{patient.diagnosis}</p>
                    </div>
                  )}

                  {patient.nextVisit && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Следующий визит: {new Date(patient.nextVisit).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      Обновлено: {new Date(patient.updatedAt).toLocaleDateString('ru-RU')}
                    </span>
                    <div className="flex space-x-2">
                      <Link href={`/doctor/patients/${patient.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/doctor/patients/${patient.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="glass-effect border-0 shadow-medical">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'Пациенты не найдены' : 'Пока нет пациентов'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Добавьте первого пациента, чтобы начать работу'
                }
              </p>
              {!searchTerm && (
                <Link href="/doctor/patients/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить пациента
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
