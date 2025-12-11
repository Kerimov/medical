import { redirect } from 'next/navigation'

export default function LegacyPatientEditRedirect({ params }: { params: { id: string } }) {
  redirect(`/doctor/patients/${params.id}/edit`)
}


