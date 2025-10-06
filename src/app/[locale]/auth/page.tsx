// src/app/[locale]/auth/page.tsx
import { redirect } from 'next/navigation'

export default function AuthPage() {
  // Redirect to LIFF-based sign in page
  redirect('/auth/nextauth/signin')
}
