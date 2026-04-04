import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../../shared/middleware/errorHandler';
import { createRateLimiter } from '../../shared/middleware/rateLimiter';
import { logger } from '../../shared/utils/logger';
import financeRoutes from './routes/finance.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(createRateLimiter());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'finance-service' });
});

// Routes
app.use('/api/finance', financeRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Finance service running on port ${PORT}`);
});

export default app;
