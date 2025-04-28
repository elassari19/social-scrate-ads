import { PrismaClient, User } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-express';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { ActorService } from '../actor/actor.service';
import { redisClient } from '../../lib/redis';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }, { user }: { user: User }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return prisma.user.findUnique({
        where: { id },
        include: {
          adReports: true,
          subscription: true,
          scrapingJobs: true,
          metrics: true,
        },
      });
    },
    users: async (_: any, __: any, { user }: { user: User }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return prisma.user.findMany();
    },
    adReports: async (
      _: any,
      { platform }: { platform: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return prisma.adReport.findMany({
        where: platform ? { platform } : undefined,
        include: { metrics: true, scrapingJob: true },
      });
    },
    actors: async (
      _: any,
      { userId }: { userId?: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return prisma.actor.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
    },
    actor: async (_: any, { namespace }: { namespace: string }) => {
      return prisma.actor.findUnique({
        where: { namespace },
      });
    },
    actorExecutions: async (
      _: any,
      { actorId, limit = 10 }: { actorId: string; limit?: number }
    ) => {
      return prisma.actorExecution.findMany({
        where: { actorId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    },
    actorRatings: async (_: any, { actorId }: { actorId: string }) => {
      return prisma.actorRating.findMany({
        where: { actorId },
        orderBy: { createdAt: 'desc' },
      });
    },
    userRating: async (
      _: any,
      { actorId, userId }: { actorId: string; userId: string }
    ) => {
      return prisma.actorRating.findUnique({
        where: {
          userId_actorId: {
            userId,
            actorId,
          },
        },
      });
    },
  },
  Mutation: {
    updateUser: async (
      _: any,
      { id, name }: { id: string; name: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return prisma.user.update({
        where: { id },
        data: { name },
      });
    },
    createAdReport: async (
      _: any,
      { platform, adContent }: { platform: string; adContent: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // First create the scraping job
      const scrapingJob = await prisma.scrapingJob.create({
        data: {
          status: 'PENDING',
          platform,
          config: JSON.stringify({ adContent }),
          startTime: new Date(),
          userId: user.id,
        },
      });

      // Then create the ad report with the job ID
      return prisma.adReport.create({
        data: {
          platform,
          adContent: JSON.stringify(adContent),
          userId: user.id,
          jobId: scrapingJob.id,
          // Optionally create metrics for the ad report
          metrics: {
            create: {
              impressions: 0,
              clicks: 0,
              engagement: 0.0,
            },
          },
        },
        include: {
          scrapingJob: true,
          metrics: true,
        },
      });
    },
    createActor: async (_: any, actorData: any, { user }: { user: User }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return prisma.actor.create({
        data: {
          ...actorData,
          userId: user.id,
        },
      });
    },
    updateActor: async (
      _: any,
      { id, ...actorData }: { id: string; [key: string]: any },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Verify ownership
      const actor = await prisma.actor.findFirst({
        where: { id, userId: user.id },
      });

      if (!actor)
        throw new Error(
          'Actor not found or you do not have permission to update it'
        );

      return prisma.actor.update({
        where: { id },
        data: actorData,
      });
    },
    deleteActor: async (
      _: any,
      { id }: { id: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Verify ownership
      const actor = await prisma.actor.findFirst({
        where: { id, userId: user.id },
      });

      if (!actor)
        throw new Error(
          'Actor not found or you do not have permission to delete it'
        );

      await prisma.actor.delete({ where: { id } });
      return true;
    },
    executeActor: async (
      _: any,
      { id, options }: { id: string; url?: string; options?: any },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Get the actor service
      const puppeteerService = new PuppeteerService(redisClient);
      const actorService = new ActorService(puppeteerService);

      return actorService.executeActor(id, options);
    },
    rateActor: async (
      _: any,
      {
        actorId,
        rating,
        comment,
      }: { actorId: string; rating: number; comment?: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Check if the actor exists
      const actor = await prisma.actor.findUnique({
        where: { id: actorId },
      });

      if (!actor) throw new Error('Actor not found');

      // Create or update the rating (upsert operation)
      return prisma.actorRating.upsert({
        where: {
          userId_actorId: {
            userId: user.id,
            actorId,
          },
        },
        update: {
          rating,
          comment,
        },
        create: {
          userId: user.id,
          actorId,
          rating,
          comment,
        },
      });
    },
    updateRating: async (
      _: any,
      {
        id,
        rating,
        comment,
      }: { id: string; rating?: number; comment?: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Verify ownership
      const existingRating = await prisma.actorRating.findFirst({
        where: { id, userId: user.id },
      });

      if (!existingRating)
        throw new Error(
          'Rating not found or you do not have permission to update it'
        );

      return prisma.actorRating.update({
        where: { id },
        data: {
          rating: rating !== undefined ? rating : existingRating.rating,
          comment: comment !== undefined ? comment : existingRating.comment,
        },
      });
    },
    deleteRating: async (
      _: any,
      { id }: { id: string },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Verify ownership
      const rating = await prisma.actorRating.findFirst({
        where: { id, userId: user.id },
      });

      if (!rating)
        throw new Error(
          'Rating not found or you do not have permission to delete it'
        );

      await prisma.actorRating.delete({ where: { id } });
      return true;
    },
  },

  // Add type resolvers to handle relationships
  User: {
    adReports: (parent: any) => {
      return prisma.adReport.findMany({
        where: { userId: parent.id },
      });
    },
    subscription: (parent: any) => {
      return prisma.subscription.findUnique({
        where: { userId: parent.id },
      });
    },
    scrapingJobs: (parent: any) => {
      return prisma.scrapingJob.findMany({
        where: { userId: parent.id },
      });
    },
    metrics: (parent: any) => {
      return prisma.userMetrics.findUnique({
        where: { userId: parent.id },
      });
    },
    actors: (parent: any) => {
      return prisma.actor.findMany({
        where: { userId: parent.id },
      });
    },
    actorRatings: (parent: any) => {
      return prisma.actorRating.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  AdReport: {
    user: (parent: any) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    scrapingJob: (parent: any) => {
      return prisma.scrapingJob.findUnique({
        where: { id: parent.jobId },
      });
    },
    metrics: (parent: any) => {
      return prisma.adMetrics.findUnique({
        where: { adReportId: parent.id },
      });
    },
  },

  ScrapingJob: {
    user: (parent: any) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    adReports: (parent: any) => {
      return prisma.adReport.findMany({
        where: { jobId: parent.id },
      });
    },
    metrics: (parent: any) => {
      return prisma.jobMetrics.findUnique({
        where: { scrapingJobId: parent.id },
      });
    },
  },

  Subscription: {
    user: (parent: any) => {
      return parent.userId
        ? prisma.user.findUnique({
            where: { id: parent.userId },
          })
        : null;
    },
  },

  Actor: {
    user: (parent: any) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    executions: (parent: any) => {
      return prisma.actorExecution.findMany({
        where: { actorId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
    ratings: (parent: any) => {
      return prisma.actorRating.findMany({
        where: { actorId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
    averageRating: async (parent: any) => {
      const ratings = await prisma.actorRating.findMany({
        where: { actorId: parent.id },
        select: { rating: true },
      });

      if (ratings.length === 0) return null;

      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
      return sum / ratings.length;
    },
  },

  ActorExecution: {
    actor: (parent: any) => {
      return prisma.actor.findUnique({
        where: { id: parent.actorId },
      });
    },
  },

  // Add resolver for ActorRating type
  ActorRating: {
    user: (parent: any) => {
      return prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    actor: (parent: any) => {
      return prisma.actor.findUnique({
        where: { id: parent.actorId },
      });
    },
  },
};
