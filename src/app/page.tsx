import { redirect } from 'next/navigation'
import { auth } from '@/lib/firebase'
import Login from '@/components/Login'

export default function Home() {
  const user = auth.currentUser

  if (user) {
    redirect('/game')
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/trivia-background.jpg')" }}>
      <Login />
    </div>
  )
}

