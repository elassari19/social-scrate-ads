import ActorForm from '@/components/forms/actor-form';
import { getActorByNamespace } from '@/lib/actor';
import { notFound } from 'next/navigation';

interface EditActorPageProps {
  params: Promise<{
    namespace: string;
  }>;
}

export default async function EditActorPage({ params }: EditActorPageProps) {
  const { namespace } = await params;

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit Actor</h1>
      <div className="max-w-4xl mx-auto">
        <ActorForm namespace={namespace} />
      </div>
    </div>
  );
}
