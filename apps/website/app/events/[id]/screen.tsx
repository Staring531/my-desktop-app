'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { EventPage } from '../../../components/signed';

export function EventScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const router = useRouter();
  const visibility = search.get('visibility') === 'public' ? 'public' : 'private';
  const originalStart = search.get('originalStart');
  return (
    <EventPage
      draft={{
        id,
        title: search.get('title') ?? '',
        location: search.get('location') ?? '',
        description: search.get('description') ?? '',
        visibility,
        start: search.get('start') ?? '',
        end: search.get('end') ?? '',
        ...(originalStart === null ? {} : { originalStart }),
      }}
      onOk={(path) => router.push(path)}
    />
  );
}
