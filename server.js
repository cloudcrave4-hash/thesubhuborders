import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/orders', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post('/api/orders', async (req, res) => {
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

app.post('/api/notify', async (req, res) => {
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
