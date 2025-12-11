'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Patient = { id: string; name: string; email: string }
type Link = { id: string; patient: Patient; permissions: any }

export function CaretakerPatientSwitcher(props: {
  selectedPatientId: string | null
  onChange: (patientId: string | null) => void
}) {
  const { token } = useAuth()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/caretaker/links', { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
        const data = await res.json()
        if (!res.ok) return
        setLinks(Array.isArray(data?.asCaretaker) ? data.asCaretaker : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const options = useMemo(() => links.map((l) => l.patient), [links])
  const hasAny = options.length > 0

  if (!hasAny) return null

  return (
    <Card className="bg-white/60">
      <CardContent className="pt-4 pb-4 flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Пациент</div>
        <div className="min-w-[260px]">
          <Select
            value={props.selectedPatientId || options[0]?.id}
            onValueChange={(v) => props.onChange(v || null)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите пациента" />
            </SelectTrigger>
            <SelectContent>
              {options.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}


