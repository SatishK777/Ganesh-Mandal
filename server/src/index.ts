import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDb, isMongoActive, mongoConnectionError, mongoDbName } from './db.js';
import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';
import contributionRoutes from './routes/contributions.js';
import expenseRoutes from './routes/expenses.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database status handler
const getDbStatus = (req: express.Request, res: express.Response) => {
  res.json({
    status: isMongoActive ? 'connected' : 'fallback',
    storage: isMongoActive ? 'MongoDB Atlas (Persistent Cloud)' : 'Local File db.json (Temporary Fallback)',
    isMongoActive,
    hasMongoUriEnv: !!process.env.MONGODB_URI,
    databaseName: mongoDbName,
    mongoConnectionError,
    time: new Date().toISOString(),
  });
};

// API Router mounted under /api and root
const apiRouter = express.Router();
apiRouter.get('/db-status', getDbStatus);
apiRouter.get('/health', getDbStatus);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/members', memberRoutes);
apiRouter.use('/contributions', contributionRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

app.use('/api', apiRouter);
app.use('/auth', authRoutes);
app.use('/members', memberRoutes);
app.use('/contributions', contributionRoutes);
app.use('/expenses', expenseRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check & status endpoints
app.get('/health', getDbStatus);
app.get('/api/db-status', getDbStatus);
app.get('/db-status', getDbStatus);

// Serve static frontend in production if built
const clientDist = path.join(process.cwd(), '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Initialize Database & Start Server
async function startServer() {
  await initDb();

  app.listen(PORT, () => {
    console.log(`🙏 Ganesh Mandal Server running on http://localhost:${PORT}`);
  });
}

startServer();
