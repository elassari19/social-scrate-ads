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

  type Query {
    user(id: ID!): User
    users: [User!]!
    adReports(platform: String): [AdReport!]!
  }

  type Mutation {
    updateUser(id: ID!, name: String!): User!
    createAdReport(platform: String!, adContent: String!): AdReport!
    generateAnalytics(reportId: ID!): Analytics!
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
