import { getActorByNamespace } from '@/app/api/actor';
import { ActorFormClient } from './actor-form-client';

interface ActorFormProps {
  namespace?: string;
}

export default async function ActorForm({ namespace }: ActorFormProps) {
  let initialData = {};
  let isEditing = false;

  // If namespace is provided, fetch actor data for editing
  if (namespace) {
    isEditing = true;
    const actorResponse = await getActorByNamespace(namespace);

    if (actorResponse.success && actorResponse.data) {
      initialData = {
        id: actorResponse.data.id,
        title: actorResponse.data.title,
        namespace: actorResponse.data.namespace,
        description: actorResponse.data.description,
        icon: actorResponse.data.icon,
        tags: actorResponse.data.tags,
        pageContent: actorResponse.data.page || '',
      };
    }
  }

  return <ActorFormClient initialData={initialData} isEditing={isEditing} />;
}
