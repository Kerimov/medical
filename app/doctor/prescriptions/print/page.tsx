import { Suspense } from 'react'
import PrintPrescriptionSheetClient from './print-client'

export default function PrintPrescriptionSheetPage() {
  // useSearchParams() must be used inside a Suspense boundary (Next.js CSR bailout requirement)
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Загрузка…</div>}>
      <PrintPrescriptionSheetClient />
    </Suspense>
  )
}


