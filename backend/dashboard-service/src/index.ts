import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../../shared/middleware/errorHandler';
import { createRateLimiter } from '../../shared/middleware/rateLimiter';
import { logger } from '../../shared/utils/logger';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3005;

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(createRateLimiter());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dashboard-service' });
});

// Routes
app.use('/api/dashboard', dashboardRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Dashboard service running on port ${PORT}`);
});

export default app;
