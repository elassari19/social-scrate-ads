/**
 * Global type definitions for the application
 */

export interface Actor {
  id: number;
  title: string;
  namespace: string;
  description: string;
  stars?: string;
  averageRating?: number;
  authorName: string;
  icon: string;
  tags: string[];
}
