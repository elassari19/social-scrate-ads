import { getActorByNamespace } from '@/app/api/actor';
import { ActorFormAI } from '@/components/forms/actor-form-ai';
import { Separator } from '@/components/ui/separator';

interface EditActorPageProps {
  params: Promise<{
    namespace: string;
  }>;
}

export default async function EditActorPage({ params }: EditActorPageProps) {
  const { namespace } = await params;

  // Fetch the actor data for editing
  let initialData = {};
  const actorResponse = await getActorByNamespace(namespace);

  if (actorResponse.success && actorResponse.data) {
    initialData = actorResponse.data;
  }

  return (
    <div className="container py-16 md:py-32 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Actor</h1>
        <p className="text-muted-foreground">
          Update your actor's configuration or enhance it with AI assistance.
        </p>
        <Separator className="my-4" />
      </div>

      <ActorFormAI initialData={initialData} isEditing={true} />
    </div>
  );
}
