import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import ViewCount from './models/ViewCount';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const viewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1,
  message: 'Same IP detected.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  })
);

app.post('/api/visit', viewLimiter, async (req: Request, res: Response) => {
  try {
    const result = await ViewCount.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update visit count' });
  }
});

app.get('/api/visit', async (_req: Request, res: Response) => {
  try {
    const data = await ViewCount.findOne();
    res.status(200).json(data || { count: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visit count' });
  }
});

app.use('/api', routes);

export default app;
