export * from './queue.config';
export * from './queue.service';
export * from './workers';

// Initialize workers when this module is imported
import './workers';
