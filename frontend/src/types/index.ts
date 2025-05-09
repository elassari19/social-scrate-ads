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
  url: string;
  price: number;
  tags: string[];
  responseFilters: {
    path: string;
    properties: string[];
    defaultResult: number;
  };
}
