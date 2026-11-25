'use client';

import { useRouter } from 'next/navigation';
import { EventPage } from '../../../components/signed';

export default function NewEventPage() {
  const router = useRouter();
  return (
    <EventPage
      draft={{
        title: '',
        location: '',
        description: '',
        visibility: 'private',
        start: '',
        end: '',
      }}
      onOk={(path) => router.push(path)}
    />
  );
}
