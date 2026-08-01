'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Legacy path — the admin console now lives entirely under /admin
export default function LegacyAdminRegisterPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/register')
  }, [router])

  return null
}
