import { PrismaClient, User } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-express';

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
    // analytics: async (
    //   _: any,
    //   { userId }: { userId: string },
    //   { user }: { user: User }
    // ) => {
    //   if (!user) throw new AuthenticationError('Not authenticated');
    //   return prisma.analytics.findMany({ where: { userId } });
    // },
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
      { id, url, options }: { id: string; url?: string; options?: any },
      { user }: { user: User }
    ) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Get the actor service
      const puppeteerService = new PuppeteerService(redis);
      const actorService = new ActorService(puppeteerService);

      return actorService.executeActor(id, url, options);
    },
    // generateAnalytics: async (_: any, { reportId }: { reportId: string }, { user }: { user: User }) => {
    //   if (!user) throw new AuthenticationError('Not authenticated');
    //   return prisma.analytics.create({
    //     data: {
    //       userId: user.id,
    //       reportId,
    //       insights: JSON.stringify({ generated: new Date() }),
    //     },
    //   });
    // },
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
  },

  ActorExecution: {
    actor: (parent: any) => {
      return prisma.actor.findUnique({
        where: { id: parent.actorId },
      });
    },
  },
};
