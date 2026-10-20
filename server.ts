import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { INITIAL_PRODUCTS } from './src/data/products.ts';
import { AREQUIPA_DISTRICTS, FREE_SHIPPING_THRESHOLD, WHATSAPP_PHONE } from './src/utils/pricing.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory / persistent mock store
interface Store {
  products: typeof INITIAL_PRODUCTS;
  orders: any[];
  leads: any[];
  complaints: any[];
  users: any[];
}

const DB_FILE = path.join(__dirname, '.db_data.json');

function loadStore(): Store {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load DB file, using defaults', e);
  }
  return {
    products: [...INITIAL_PRODUCTS],
    orders: [
      {
        id: "UV-40912",
        items: [
          {
            slug: "polo-misti",
            nombre: "Polo manga larga Misti",
            precio: 129,
            color: "Crudo",
            talla: "M",
            cantidad: 1
          },
          {
            slug: "short-running",
            nombre: "Short running 7″",
            precio: 89,
            color: "Negro",
            talla: "M",
            cantidad: 1
          }
        ],
        subtotal: 218,
        discount: 0,
        shipping: 8,
        total: 226,
        customer: {
          nombre: "Mariana Cáceres",
          email: "mariana.caceres@example.com",
          whatsapp: "+51 954 112 233",
          direccion: "Calle Jerusalén 304",
          distrito: "Yanahuara",
          nota: "Dejar en conserjería"
        },
        estado: "Confirmado",
        createdAt: "2026-10-18T10:30:00.000Z"
      }
    ],
    leads: [
      {
        id: "LEAD-101",
        email: "carlos.vargas@arequiparun.com",
        nombre: "Carlos Vargas",
        tipo: "Run Club",
        createdAt: "2026-10-17T15:20:00.000Z"
      }
    ],
    complaints: [],
    users: [
      {
        id: "USR-001",
        email: "admin@urbanvibesport.com",
        password: "admin",
        nombre: "Administrador Urban Vibe",
        whatsapp: "+51 925 147 306",
        role: "admin"
      },
      {
        id: "USR-002",
        email: "demo@urbanvibesport.com",
        password: "demo",
        nombre: "Atleta Altura",
        whatsapp: "+51 987 654 321",
        role: "user"
      }
    ]
  };
}

let store: Store = loadStore();

function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Failed to save DB file', e);
  }
}

// Public API
app.get('/api/products', (req, res) => {
  res.json(store.products);
});

app.get('/api/config', (req, res) => {
  res.json({
    districts: AREQUIPA_DISTRICTS,
    freeShipping: FREE_SHIPPING_THRESHOLD,
    whatsapp: WHATSAPP_PHONE,
    storage: "Urban Vibe Cloud D1"
  });
});

app.post('/api/orders', (req, res) => {
  const { customer, items, subtotal, discount, shipping, total, coupon } = req.body;
  if (!customer || !items || !items.length) {
    return res.status(400).json({ error: "Datos del pedido incompletos" });
  }

  const orderId = `UV-${Math.floor(10000 + Math.random() * 90000)}`;
  const newOrder = {
    id: orderId,
    customer,
    items,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    estado: 'Pendiente',
    createdAt: new Date().toISOString()
  };

  // Reduce product stock
  items.forEach((item: any) => {
    const prod = store.products.find(p => p.slug === item.slug);
    if (prod && prod.stock >= item.cantidad) {
      prod.stock -= item.cantidad;
    }
  });

  store.orders.unshift(newOrder);
  saveStore();

  res.status(201).json(newOrder);
});

app.get('/api/orders', (req, res) => {
  res.json(store.orders);
});

app.post('/api/leads', (req, res) => {
  const { email, nombre, tipo } = req.body;
  if (!email) {
    return res.status(400).json({ error: "El correo es requerido" });
  }
  const lead = {
    id: `LEAD-${Date.now().toString().slice(-4)}`,
    email,
    nombre: nombre || 'Atleta',
    tipo: tipo || 'Newsletter / Guía',
    createdAt: new Date().toISOString()
  };
  store.leads.unshift(lead);
  saveStore();
  res.json({ ok: true, lead });
});

app.post('/api/complaints', (req, res) => {
  const data = req.body;
  const ticket = `REC-${Date.now().toString().slice(-6)}`;
  const complaint = {
    ticket,
    ...data,
    createdAt: new Date().toISOString()
  };
  store.complaints.unshift(complaint);
  saveStore();
  res.json({ ok: true, ticket });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (user && user.password === password) {
    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  }
  // Allow default fallback or demo login
  if (email && email.includes('@')) {
    const defaultUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      email,
      nombre: email.split('@')[0],
      whatsapp: '+51 925 147 306',
      role: email.includes('admin') ? 'admin' : 'user'
    };
    return res.json(defaultUser);
  }
  res.status(401).json({ error: "Credenciales no válidas" });
});

app.post('/api/register', (req, res) => {
  const { nombre, email, whatsapp, password } = req.body;
  if (!email || !nombre) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    nombre,
    email,
    whatsapp: whatsapp || '',
    password: password || '123456',
    role: email.toLowerCase().includes('admin') ? 'admin' : 'user'
  };
  store.users.push(newUser);
  saveStore();
  const { password: _, ...safeUser } = newUser;
  res.json(safeUser);
});

app.get('/api/session', (req, res) => {
  res.json({ user: null });
});

app.post('/api/logout', (req, res) => {
  res.json({ ok: true });
});

// Admin endpoints
app.get('/api/admin/overview', (req, res) => {
  const totalSales = store.orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = store.orders.filter(o => o.estado === 'Pendiente').length;
  const totalStock = store.products.reduce((acc, p) => acc + p.stock, 0);
  const lowStock = store.products.filter(p => p.stock <= 5).length;

  res.json({
    totalSales,
    ordersCount: store.orders.length,
    pendingOrders,
    leadsCount: store.leads.length,
    complaintsCount: store.complaints.length,
    totalStock,
    lowStock
  });
});

app.get('/api/admin/products', (req, res) => {
  res.json(store.products);
});

app.put('/api/admin/products/:slug', (req, res) => {
  const { slug } = req.params;
  const index = store.products.findIndex(p => p.slug === slug);
  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  store.products[index] = { ...store.products[index], ...req.body };
  saveStore();
  res.json(store.products[index]);
});

app.get('/api/admin/orders', (req, res) => {
  res.json(store.orders);
});

app.put('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = store.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  Object.assign(order, req.body);
  saveStore();
  res.json(order);
});

app.get('/api/admin/database', (req, res) => {
  const table = (req.query.table as string) || 'products';
  if (table === 'products') return res.json({ table, data: store.products });
  if (table === 'orders') return res.json({ table, data: store.orders });
  if (table === 'leads') return res.json({ table, data: store.leads });
  if (table === 'complaints') return res.json({ table, data: store.complaints });
  if (table === 'users') return res.json({ table, data: store.users.map(({ password, ...u }) => u) });
  res.status(400).json({ error: "Tabla desconocida" });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Urban Vibe Sport server listening on port ${PORT}`);
  });
}

startServer();
