import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="heading-1 text-ink-black mb-2">featherink</h1>
        </div>
        
        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  )
}
