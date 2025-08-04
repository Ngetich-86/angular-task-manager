import express from 'express';
import type { Request, Response } from 'express';
import { logger } from './config/logger';
import { rateLimiterMiddleware } from './config/rateLimiter';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(logger);
app.use(rateLimiterMiddleware);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express Server!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
