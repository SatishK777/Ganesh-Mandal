import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDb } from './db.js';
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

// Initialize Database & Seed data if missing
initDb();

// API Router mounted under /api and root
const apiRouter = express.Router();
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve static frontend in production if built
const clientDist = path.join(process.cwd(), '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🙏 Ganesh Mandal Server running on http://localhost:${PORT}`);
});
