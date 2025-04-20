import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    updatedAt: String!
    subscription: Subscription
    adReports: [AdReport!]
    scrapingJobs: [ScrapingJob!]
    metrics: UserMetrics
    actors: [Actor!]!
  }

  type AdReport {
    id: ID!
    platform: String!
    adContent: String!
    createdAt: String!
    updatedAt: String!
    userId: String!
    user: User!
    scrapingJob: ScrapingJob!
    jobId: String!
    metrics: AdMetrics
  }

  type AdMetrics {
    id: ID!
    impressions: Int!
    clicks: Int!
    engagement: Float!
    sentiment: Float
    performance: String
    createdAt: String!
    updatedAt: String!
    adReportId: String!
  }

  type UserMetrics {
    id: ID!
    totalScrapingJobs: Int!
    totalAdReports: Int!
    avgJobDuration: Float
    lastActivityDate: String!
    createdAt: String!
    updatedAt: String!
    userId: String!
  }

  type Subscription {
    id: ID!
    plan: String!
    status: String!
    startDate: String!
    endDate: String!
    requestLimit: Int!
    dataPointLimit: Int!
    requestCount: Int!
    lastResetDate: String!
    userId: String
    user: User
  }

  type ScrapingJob {
    id: ID!
    status: String!
    platform: String!
    config: String!
    startTime: String
    endTime: String
    createdAt: String!
    updatedAt: String!
    userId: String!
    user: User!
    adReports: [AdReport!]!
    metrics: JobMetrics
  }

  type JobMetrics {
    id: ID!
    duration: Int
    adsScraped: Int!
    successRate: Float!
    errorCount: Int!
    resourceUsage: String
    createdAt: String!
    updatedAt: String!
    scrapingJobId: String!
  }

  type Actor {
    id: ID!
    title: String!
    namespace: String!
    description: String!
    stars: String!
    rating: Float!
    authorName: String!
    authorBadgeColor: String!
    icon: String!
    iconBg: String!
    script: String!
    createdAt: String!
    updatedAt: String!
    user: User!
    executions: [ActorExecution!]!
  }

  type ActorExecution {
    id: ID!
    status: String!
    startTime: String!
    endTime: String
    results: JSON
    logs: String
    createdAt: String!
    updatedAt: String!
    actor: Actor!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    adReports(platform: String): [AdReport!]!
    actors(userId: ID): [Actor!]!
    actor(namespace: String!): Actor
    actorExecutions(actorId: ID!, limit: Int): [ActorExecution!]!
  }

  type Mutation {
    updateUser(id: ID!, name: String!): User!
    createAdReport(platform: String!, adContent: String!): AdReport!
    generateAnalytics(reportId: ID!): Analytics!
    createActor(
      title: String!
      namespace: String!
      description: String!
      stars: String!
      rating: Float!
      authorName: String!
      authorBadgeColor: String!
      icon: String!
      iconBg: String!
      script: String!
    ): Actor!

    updateActor(
      id: ID!
      title: String
      namespace: String
      description: String
      stars: String
      rating: Float
      authorName: String
      authorBadgeColor: String
      icon: String
      iconBg: String
      script: String
    ): Actor!

    deleteActor(id: ID!): Boolean!

    executeActor(id: ID!, url: String, options: JSON): ActorExecution!
  }

  type Analytics {
    id: ID!
    userId: String!
    reportId: String!
    insights: String!
    createdAt: String!
    updatedAt: String!
  }
`;
