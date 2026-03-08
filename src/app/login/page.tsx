import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F9FC' }}>
      {/* Top Header Bar */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E0E0E2', width: '100%', padding: '16px 0', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Yantramanav', sans-serif", fontWeight: 700, fontSize: '20px', color: '#2C2C30', margin: 0 }}>featherink</h1>
      </header>

      {/* Login Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px 0' }}>
        <h2 className="heading-2" style={{ color: '#2C2C30', marginBottom: '32px' }}>Login to your account</h2>
        <div style={{ width: '100%', maxWidth: '512px' }}>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
