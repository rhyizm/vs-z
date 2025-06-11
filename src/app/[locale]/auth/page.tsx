// src/app/[locale]/auth/page.tsx
import { redirect } from 'next/navigation'

export default function AuthPage() {
  // Redirect to NextAuth sign in page
  redirect('/auth/nextauth/signin')
}