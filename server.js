import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-env';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Simple in-memory user store (use Supabase users table in production)
const users = new Map();

// Initialize users
async function initializeUsers() {
  users.set('admin', {
    email: 'admin@example.com',
    passwordHash: await bcryptjs.hash('retrygede', 10)
  });
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (users.has(username)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    users.set(username, { email, passwordHash });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const user = users.get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Protected API Routes
app.get('/api/orders', authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const order = req.body;
  const { data, error } = await supabase.from('orders').insert([{
    name: order.name,
    product: order.product,
    cost: order.cost,
    sell: order.sell,
    end_date: order.endDate,
    duration_label: order.durationLabel,
    notified: order.notified || false
  }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

app.post('/api/notify', authenticateToken, async (req, res) => {
  if (!DISCORD_WEBHOOK_URL) {
    return res.status(500).json({ error: 'Discord webhook is not configured.' });
  }

  const { name, product, endDate, daysLeft } = req.body || {};

  if (!name || !product || !endDate || !Number.isFinite(Number(daysLeft))) {
    return res.status(400).json({ error: 'Missing notification details.' });
  }

  const webhookRes = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: 'Subscription Expiring Soon',
        color: 16776960,
        fields: [
          { name: 'Customer', value: String(name).slice(0, 256), inline: true },
          { name: 'Product', value: String(product).slice(0, 256), inline: true },
          { name: 'Expires', value: String(endDate).slice(0, 256), inline: true },
          { name: 'Days Left', value: String(daysLeft).slice(0, 256), inline: true }
        ],
        footer: { text: 'Subscription expiring soon' }
      }]
    })
  });

  if (!webhookRes.ok) {
    return res.status(502).json({ error: 'Discord notification failed.' });
  }

  res.status(204).end();
});

app.delete('/api/orders', authenticateToken, async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(204).end();
  } catch (err) {
    return res.status(500).json({ error: 'Delete failed' });
  }
});

const port = process.env.PORT || 3000;

(async () => {
  await initializeUsers();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();
