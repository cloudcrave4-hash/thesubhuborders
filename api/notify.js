const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

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

  return res.status(204).end();
}
