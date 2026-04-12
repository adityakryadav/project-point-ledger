const { query, getClient } = require('../config/db');
const crypto = require('crypto');

// Encrypt card token (we never store full card numbers)
const encryptToken = (data) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'defaultkey123456defaultkey123456', 'utf8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Mock: simulate fetching reward points from bank APIs
const mockFetchPoints = (bankName, cardType) => {
  const pointMap = {
    'HDFC Bank': { min: 1200, max: 8500 },
    'SBI': { min: 500, max: 5000 },
    'ICICI Bank': { min: 800, max: 6000 },
    'Axis Bank': { min: 300, max: 4500 },
    'Kotak': { min: 200, max: 3000 },
    default: { min: 100, max: 2000 },
  };
  const range = pointMap[bankName] || pointMap.default;
  const points = Math.floor(Math.random() * (range.max - range.min) + range.min);
  const expiringPoints = Math.floor(points * 0.15); // 15% expiring soon
  const daysToExpiry = Math.floor(Math.random() * 4) + 1; // 1-4 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysToExpiry);
  return { points, expiringPoints, expiryDate };
};

// GET /api/cards
const getCards = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.*, rp.available_points, rp.expiring_points, rp.expiry_date, rp.last_synced_at
       FROM cards c
       LEFT JOIN reward_points rp ON rp.card_id = c.id
       WHERE c.user_id = $1 AND c.is_active = true
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json({ cards: rows });
  } catch (err) {
    console.error('Get cards error:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

// POST /api/cards
const addCard = async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { card_name, bank_name, last_four_digits, card_type, network, reward_program } = req.body;

    // Tokenize (in production: use a real card vault like Stripe or Razorpay)
    const card_token = encryptToken(`${bank_name}:${last_four_digits}:${Date.now()}`);

    const { rows: cardRows } = await client.query(
      `INSERT INTO cards (user_id, card_name, bank_name, last_four_digits, card_type, network, reward_program, card_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, card_name, bank_name, last_four_digits, card_type, network, reward_program, card_token]
    );

    const card = cardRows[0];

    // Mock fetch reward points
    const { points, expiringPoints, expiryDate } = mockFetchPoints(bank_name, card_type);

    await client.query(
      `INSERT INTO reward_points (card_id, user_id, available_points, expiring_points, expiry_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [card.id, req.user.id, points, expiringPoints, expiryDate]
    );

    // Log in reward history
    await client.query(
      `INSERT INTO reward_history (user_id, card_id, transaction_type, points, description)
       VALUES ($1, $2, 'synced', $3, $4)`,
      [req.user.id, card.id, points, `Initial sync for ${card_name}`]
    );

    await client.query('COMMIT');

    res.status(201).json({
      card: { ...card, available_points: points, expiring_points: expiringPoints, expiry_date: expiryDate },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Add card error:', err);
    res.status(500).json({ error: 'Failed to add card' });
  } finally {
    client.release();
  }
};

// POST /api/cards/:id/sync
const syncCard = async (req, res) => {
  try {
    const { rows: cardRows } = await query(
      'SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND is_active = true',
      [req.params.id, req.user.id]
    );

    if (cardRows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const card = cardRows[0];
    const { points, expiringPoints, expiryDate } = mockFetchPoints(card.bank_name, card.card_type);

    const { rows } = await query(
      `UPDATE reward_points
       SET available_points = $1, expiring_points = $2, expiry_date = $3, last_synced_at = NOW()
       WHERE card_id = $4
       RETURNING *`,
      [points, expiringPoints, expiryDate, card.id]
    );

    res.json({ reward_points: rows[0] });
  } catch (err) {
    console.error('Sync card error:', err);
    res.status(500).json({ error: 'Failed to sync card' });
  }
};

// DELETE /api/cards/:id
const deleteCard = async (req, res) => {
  try {
    const { rows } = await query(
      'UPDATE cards SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove card' });
  }
};

module.exports = { getCards, addCard, syncCard, deleteCard };
