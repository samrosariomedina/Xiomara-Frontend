import type { Metadata } from 'next'
import LoginForm from '@/pages/LoginForm';

export const metadata: Metadata = {
  title: 'Xiomara',
  description: 'Welcome to Xiomara. Sign in to access your account.'
}

export default function Home() {

  return (
  <div>
  <LoginForm />
  </div>
  );
}
