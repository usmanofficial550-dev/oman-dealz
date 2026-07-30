require('dotenv').config();
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
const db = require('./db');

// Password verification using Node's built-in crypto (no extra dependency needed)
function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hashHex] = stored.split(':');
  const derived = crypto.scryptSync(password || '', salt, 64).toString('hex');
  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(hashHex, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- Admin credentials come from environment variables, never hardcoded ---
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
// Generate this hash once with: node hash-password.js yourpassword
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 hour session
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// --- Auth middleware ---
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Not authorized' });
}

// ============ AUTH ROUTES ============
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!ADMIN_PASSWORD_HASH) {
    return res.status(500).json({ error: 'Admin password not configured on server' });
  }
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = verifyPassword(password, ADMIN_PASSWORD_HASH);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.isAdmin = true;
  res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ============ PUBLIC PRODUCT ROUTES ============
app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

// ============ ADMIN PRODUCT ROUTES ============
app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { name, description, price, image_url, in_stock, category } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const id = db.insertProduct({ name, description, price, image_url, in_stock, category });
  res.json({ id });
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { name, description, price, image_url, in_stock, category } = req.body;
  db.updateProduct(req.params.id, { name, description, price, image_url, in_stock, category });
  res.json({ success: true });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.deleteProduct(req.params.id);
  res.json({ success: true });
});

// ============ ORDER ROUTES ============
app.post('/api/orders', (req, res) => {
  const { customer_name, email, address, city, zip, items, total } = req.body;
  if (!customer_name || !email || !address || !items || !total) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }
  const orderId = db.insertOrder({ customer_name, email, address, city, zip, items, total });
  res.json({ success: true, orderId });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  res.json(db.getOrders());
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  db.updateOrderStatus(req.params.id, status);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Store server running on port ${PORT}`);
});
