import { Request, Response } from 'express';
import { ActorService } from './actor.service';

export class ActorController {
  constructor(private actorService: ActorService) {}

  getAllActors = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const actors = await this.actorService.getAllActors(userId);
      res.json(actors);
    } catch (error) {
      console.error('Error fetching actors:', error);
      res.status(500).json({ error: 'Failed to fetch actors' });
    }
  };

  getActorByNamespace = async (req: Request, res: Response): Promise<void> => {
    try {
      const { namespace } = req.params;
      const actor = await this.actorService.getActorByNamespace(namespace);

      if (!actor) {
        res.status(404).json({ error: 'Actor not found' });
        return;
      }

      res.json(actor);
    } catch (error) {
      console.error('Error fetching actor:', error);
      res.status(500).json({ error: 'Failed to fetch actor' });
    }
  };

  createActor = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const actor = await this.actorService.createActor(req.body, userId);
      res.status(201).json(actor);
    } catch (error) {
      console.error('Error creating actor:', error);
      res.status(500).json({ error: 'Failed to create actor' });
    }
  };

  updateActor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const actor = await this.actorService.updateActor(id, req.body, userId);
      res.json(actor);
    } catch (error) {
      console.error('Error updating actor:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to update actor' });
    }
  };

  deleteActor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      await this.actorService.deleteActor(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting actor:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to delete actor' });
    }
  };

  executeActor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { url, options } = req.body;

      const result = await this.actorService.executeActor(id, url, options);
      res.json(result);
    } catch (error) {
      console.error('Error executing actor:', error);
      res.status(500).json({ error: 'Failed to execute actor' });
    }
  };

  getActorExecutions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const executions = await this.actorService.getActorExecutions(
        id,
        limit ? parseInt(limit as string, 10) : 10
      );

      res.json(executions);
    } catch (error) {
      console.error('Error fetching actor executions:', error);
      res.status(500).json({ error: 'Failed to fetch actor executions' });
    }
  };
}
