/**
 * Global type definitions for the application
 */

export interface Actor {
  id: string;
  title: string;
  namespace: string;
  description: string;
  stars?: string;
  averageRating?: number;
  authorName: string;
  icon: string;
  url?: string; // Add URL field as optional
  tags: string[];
}
