import { Request, Response } from 'express';
import { ActorService } from './actor.service';
import { createDeepSeekService, DeepSeekService } from '../../lib/deepseek';
import { redisClient } from '../../lib/redis';

export class ActorController {
  private deepSeekService: DeepSeekService;

  constructor(private actorService: ActorService) {
    // Initialize the DeepSeekService with Redis for caching
    const redis = redisClient;
    this.deepSeekService = createDeepSeekService(
      process.env.DEEPSEEK_API_KEY,
      redis
    );
  }

  getAllActors = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { limit, page, q, category } = req.query;

      // Parse numeric parameters
      const limitNum = limit ? parseInt(limit as string) : 15; // Default to 15
      const pageNum = page ? parseInt(page as string) : 1; // Default to page 1

      // Get filtering parameters
      const search = (q as string) || undefined;
      const categoryFilter = (category as string) || undefined;

      const actors = await this.actorService.getAllActors(
        userId,
        limitNum,
        pageNum,
        search,
        categoryFilter
      );

      res.json(actors);
    } catch (error) {
      console.error('Error fetching actors:', error);
      res.status(500).json({ error: 'Failed to fetch actors' });
    }
  };

  getActorById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const actor = await this.actorService.getActorById(id, userId);

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
    console.log('Updating actor with body:', req.body);
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
      const { options } = req.body;

      // We no longer need the URL from the request body, as we'll use the one stored in the actor model
      const result = await this.actorService.executeActor(id, options);
      res.json(result);
    } catch (error) {
      console.error('Error executing actor:', error);
      res.status(500).json({ error: 'Failed to execute actor' });
    }
  };

  executeActorWithDeepSeek = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Get the namespace from request parameters
      const { namespace } = req.params;
      const { platformUrl, prompt, additionalContext } = req.body;

      const urlPrompt = `Update the URL ${platformUrl} queries,
      - the URL should be following the user prompt: ${prompt}.
      - The URL should be a valid URL that can be used to fetch data from the platform.
      - The Prompt can have multiple requirements like: location, limit, offset, filters, etc.
      - The URL should be in the format of ${platformUrl}.
      - Return ONLY a URL:
      `;

      console.log(`Executing with platform: ${platformUrl || 'not specified'}`);

      // Pass the namespace directly to the service
      const generateUrl = await this.deepSeekService.generateUrl(
        platformUrl,
        urlPrompt,
        additionalContext
      );

      res.json({
        prompt,
        url: generateUrl,
      });
    } catch (error) {
      console.error('Error executing actor with DeepSeek:', error);
      res.status(500).json({
        error: 'Failed to execute actor with DeepSeek AI',
        message: error instanceof Error ? error.message : String(error),
      });
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

  rateActor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { actorId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const ratingResult = await this.actorService.rateActor(
        actorId,
        userId,
        rating,
        comment
      );

      res.status(201).json(ratingResult);
    } catch (error) {
      console.error('Error rating actor:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to rate actor' });
    }
  };

  getUserRating = async (req: Request, res: Response): Promise<void> => {
    try {
      const { actorId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const rating = await this.actorService.getUserRating(actorId, userId);

      if (!rating) {
        res.status(404).json({ error: 'Rating not found' });
        return;
      }

      res.json(rating);
    } catch (error) {
      console.error('Error fetching user rating:', error);
      res.status(500).json({ error: 'Failed to fetch user rating' });
    }
  };

  getActorRatings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { actorId } = req.params;
      const ratings = await this.actorService.getActorRatings(actorId);

      res.json(ratings);
    } catch (error) {
      console.error('Error fetching actor ratings:', error);
      res.status(500).json({ error: 'Failed to fetch actor ratings' });
    }
  };

  updateRating = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const updatedRating = await this.actorService.updateRating(id, userId, {
        rating,
        comment,
      });

      res.json(updatedRating);
    } catch (error) {
      console.error('Error updating rating:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to update rating' });
    }
  };

  deleteRating = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      await this.actorService.deleteRating(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting rating:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to delete rating' });
    }
  };
}
