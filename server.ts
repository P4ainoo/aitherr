import express from 'express';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { getDb, saveDb, User } from './db.js';
import path from 'path';
import { Resend } from 'resend';
import http from 'http';
import { Server } from 'socket.io';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const resend = new Resend(process.env.RESEND_API_KEY);

// Define structures for collaborative sessions
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

interface SessionState {
  plan: any | null;
  messages: ChatMessage[];
  users: Map<string, { id: string, name: string }>;
}

const activeSessions = new Map<string, SessionState>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('join_session', ({ sessionId, user }) => {
      socket.join(sessionId);
      
      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, { plan: null, messages: [], users: new Map() });
      }
      
      const session = activeSessions.get(sessionId)!;
      session.users.set(socket.id, user);

      // Send current state to the joining user
      socket.emit('session_state', {
        plan: session.plan,
        messages: session.messages,
        users: Array.from(session.users.values())
      });

      // Announce new user to others
      socket.to(sessionId).emit('user_joined', user);

      socket.on('disconnect', () => {
        session.users.delete(socket.id);
        io.to(sessionId).emit('user_left', socket.id);
      });
    });

    socket.on('send_message', ({ sessionId, message }) => {
      const session = activeSessions.get(sessionId);
      if (session) {
        session.messages.push(message);
        io.to(sessionId).emit('new_message', message);
      }
    });

    socket.on('update_plan', ({ sessionId, newPlan }) => {
      const session = activeSessions.get(sessionId);
      if (session) {
        session.plan = newPlan;
        socket.to(sessionId).emit('plan_updated', newPlan); // broadcast to others
      }
    });
  });

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  app.post('/api/sessions/create', (req, res) => {
    const { plan } = req.body;
    const sessionId = Math.random().toString(36).substring(2, 10);
    
    activeSessions.set(sessionId, {
      plan: plan,
      messages: [],
      users: new Map()
    });
    
    res.json({ sessionId });
  });

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    const db = getDb();

    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      passwordHash,
      name,
      bookedTrips: [],
    };

    db.users.push(newUser);
    saveDb(db);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const db = getDb();
      const user = db.users.find(u => u.id === decoded.userId);
      if (!user) return res.status(401).json({ message: 'User not found' });

      res.json({ user: { id: user.id, email: user.email, name: user.name, bookedTrips: user.bookedTrips } });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.post('/api/bookings', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const db = getDb();
      const userIndex = db.users.findIndex(u => u.id === decoded.userId);
      if (userIndex === -1) return res.status(401).json({ message: 'User not found' });

      const booking = req.body;
      db.users[userIndex].bookedTrips.push(booking);
      saveDb(db);

      res.json({ message: 'Booking saved', bookedTrips: db.users[userIndex].bookedTrips });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  app.post('/api/email/itinerary', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ message: 'Resend API key is not configured' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const db = getDb();
      const user = db.users.find(u => u.id === decoded.userId);
      if (!user) return res.status(401).json({ message: 'User not found' });

      const { plan, htmlBody } = req.body;

      const { data, error } = await resend.emails.send({
        from: 'Aither Travel <onboarding@resend.dev>',
        to: user.email,
        subject: `Your Aither Travel Itinerary: ${plan.country}`,
        html: htmlBody,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({ message: 'Email sent successfully', data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to send email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 5, use *all instead of *
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
