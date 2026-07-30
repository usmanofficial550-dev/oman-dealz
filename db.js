const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      nextProductId: 2,
      nextOrderId: 1,
      products: [
        {
          id: 1,
          name: 'Sample Product',
          description: 'Replace this with your real products from the admin panel.',
          price: 9.99,
          image_url: '',
          in_stock: 1,
          category: 'other',
          created_at: new Date().toISOString()
        }
      ],
      orders: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---- Products ----
function getProducts() {
  const data = loadData();
  return data.products.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getProduct(id) {
  const data = loadData();
  return data.products.find(p => p.id === Number(id));
}

function insertProduct({ name, description, price, image_url, in_stock, category }) {
  const data = loadData();
  const product = {
    id: data.nextProductId++,
    name,
    description: description || '',
    price,
    image_url: image_url || '',
    in_stock: in_stock ? 1 : 0,
    category: category || 'other',
    created_at: new Date().toISOString()
  };
  data.products.push(product);
  saveData(data);
  return product.id;
}

function updateProduct(id, { name, description, price, image_url, in_stock, category }) {
  const data = loadData();
  const product = data.products.find(p => p.id === Number(id));
  if (!product) return false;
  product.name = name;
  product.description = description || '';
  product.price = price;
  product.image_url = image_url || '';
  product.in_stock = in_stock ? 1 : 0;
  product.category = category || 'other';
  saveData(data);
  return true;
}

function deleteProduct(id) {
  const data = loadData();
  data.products = data.products.filter(p => p.id !== Number(id));
  saveData(data);
}

// ---- Orders ----
function getOrders() {
  const data = loadData();
  return data.orders.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function insertOrder({ customer_name, email, address, city, zip, items, total }) {
  const data = loadData();
  const order = {
    id: data.nextOrderId++,
    customer_name,
    email,
    address,
    city: city || '',
    zip: zip || '',
    items,
    total,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  data.orders.push(order);
  saveData(data);
  return order.id;
}

function updateOrderStatus(id, status) {
  const data = loadData();
  const order = data.orders.find(o => o.id === Number(id));
  if (!order) return false;
  order.status = status;
  saveData(data);
  return true;
}

module.exports = {
  getProducts,
  getProduct,
  insertProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  insertOrder,
  updateOrderStatus
};
