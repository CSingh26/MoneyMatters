import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../../shared/middleware/errorHandler';
import { createRateLimiter } from '../../shared/middleware/rateLimiter';
import { logger } from '../../shared/utils/logger';
import aiRoutes from './routes/ai.routes';

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3004;

// Global middleware
app.use(helmet());
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
app.use(cors({
  origin: corsOrigins.includes('*') ? true : corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' })); // Larger limit for PDF text payloads
app.use(createRateLimiter());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-service' });
});

// Routes
app.use('/api/ai', aiRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`AI service running on port ${PORT}`);
});

export default app;
