'use client';

import { useRouter } from 'next/navigation';
import { CompleteRecoveryForm } from '../../../components/auth-forms';

export default function CompleteRecoveryPage() {
  const router = useRouter();
  return <CompleteRecoveryForm onOk={(path) => router.push(path)} />;
}
