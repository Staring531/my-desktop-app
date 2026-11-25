import { Suspense } from 'react';
import { EventScreen } from './screen';

export default function EventRoute({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <EventScreen params={params} />
    </Suspense>
  );
}
