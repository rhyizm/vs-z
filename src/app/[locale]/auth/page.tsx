// src/app/[locale]/auth/page.tsx
import AuthenticationForm from '@/lib/supabase/client/AuthenticationForm'

export default function AuthPage() {
  return (
    <div
      className="
        w-full
        max-w-md
        pt-[6rem]
        mx-auto
      "
    >
      <AuthenticationForm />
    </div>
  )
}
