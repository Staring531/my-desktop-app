'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '../../components/auth-forms';

export default function LoginPage() {
  const router = useRouter();
  return <LoginForm onOk={(path) => router.push(path)} />;
}
