'use client';

import { useRouter } from 'next/navigation';
import { VerifyForm } from '../../components/auth-forms';

export default function VerifyPage() {
  const router = useRouter();
  return <VerifyForm onOk={(path) => router.push(path)} />;
}
