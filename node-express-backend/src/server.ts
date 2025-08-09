import express from 'express';
import type { Request, Response } from 'express';
import { logger } from './config/logger';
import { rateLimiterMiddleware } from './config/rateLimiter';
import db from './drizzle/db';
import { users } from './drizzle/schema';
import cors from 'cors'
import AuthRouter from './auth/auth.router';
import TasksRouter from './tasks/tasks.router';

const app = express();
const PORT = process.env.PORT || 7000;

// db connection  test
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.select().from(users).limit(1);
    res.json({ success: true, result });
  }
  catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Database connection failed:', err);
    res.status(500).json({ success: false, error: err.message });
  } else {
    console.error('Unknown error:', err);
    res.status(500).json({ success: false, error: 'Unknown error' });
  }
}
});

// Middleware
app.use(express.json());
app.use(logger);
app.use(rateLimiterMiddleware);
app.use(cors({
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
    }))

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express Server!');
});

app.use('/auth', AuthRouter);
app.use('/tasks', TasksRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
