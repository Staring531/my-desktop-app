'use client';

import { useRouter } from 'next/navigation';
import { AccountPage } from '../../components/signed';

export default function Page() {
  const router = useRouter();
  return <AccountPage onOk={(path) => router.push(path)} />;
}
