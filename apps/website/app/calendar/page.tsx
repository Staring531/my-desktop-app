'use client';

import { useRouter } from 'next/navigation';
import { CalendarPage } from '../../components/signed';

export default function Page() {
  const router = useRouter();
  return <CalendarPage onOk={(path) => router.push(path)} />;
}
