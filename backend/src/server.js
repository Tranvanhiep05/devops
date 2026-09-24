const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "data", "products.json");
const ORDERS_FILE = path.join(__dirname, "data", "orders.json");
const USERS_FILE = path.join(__dirname, "data", "users.json");
const ORDER_STATUSES = ["pending", "confirmed", "shipping", "completed", "cancelled"];

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// token -> { expiry, username, role } (in-memory session store, reset on server restart)
const sessions = new Map();

function issueToken(username, role) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { expiry: Date.now() + TOKEN_TTL_MS, username, role });
  return token;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function loadUsers() {
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function nextUserId(users) {
  return users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const session = token && sessions.get(token);

  if (!session || session.expiry < Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ error: "unauthorized" });
  }
  req.user = { username: session.username, role: session.role };
  req.token = token;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Chỉ admin mới được phép thực hiện thao tác này" });
  }
  next();
}

app.use(cors());
app.use(express.json());

app.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập tên đăng nhập" });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 4 ký tự" });
  }

  const normalized = username.trim().toLowerCase();
  if (normalized === ADMIN_USERNAME.toLowerCase()) {
    return res.status(409).json({ error: "Tên đăng nhập đã tồn tại" });
  }

  const users = loadUsers();
  if (users.some((u) => u.username.toLowerCase() === normalized)) {
    return res.status(409).json({ error: "Tên đăng nhập đã tồn tại" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const user = {
    id: nextUserId(users),
    username: username.trim(),
    role: "customer",
    salt,
    hash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);

  const token = issueToken(user.username, user.role);
  res.status(201).json({ token, username: user.username, role: user.role });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = issueToken(ADMIN_USERNAME, "admin");
    return res.json({ token, username: ADMIN_USERNAME, role: "admin" });
  }

  const users = loadUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || hashPassword(password, user.salt) !== user.hash) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }

  const token = issueToken(user.username, user.role);
  res.json({ token, username: user.username, role: user.role });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  sessions.delete(req.token);
  res.status(204).send();
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json(req.user);
});

function loadProducts() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), "utf-8");
}

function nextId(products) {
  return products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

function loadOrders() {
  const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

function nextOrderId(orders) {
  return orders.reduce((max, o) => Math.max(max, o.id), 0) + 1;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
  res.json(loadProducts());
});

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = loadProducts().find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: "product not found" });
  res.json(product);
});

app.post("/api/products", requireAuth, requireAdmin, (req, res) => {
  const { name, price, description = "", image = "", stock = 0, category = "" } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (typeof price !== "number" || price < 0) {
    return res.status(400).json({ error: "price must be a non-negative number" });
  }

  const products = loadProducts();
  const product = {
    id: nextId(products),
    name: name.trim(),
    price,
    description,
    image,
    stock: Number(stock) || 0,
    category,
  };
  products.push(product);
  saveProducts(products);
  res.status(201).json(product);
});

app.put("/api/products/:id", requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const products = loadProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: "product not found" });

  const { name, price, description, image, stock, category } = req.body;
  if (typeof name === "string" && name.trim()) product.name = name.trim();
  if (typeof price === "number" && price >= 0) product.price = price;
  if (typeof description === "string") product.description = description;
  if (typeof image === "string") product.image = image;
  if (typeof category === "string") product.category = category;
  if (stock !== undefined && !Number.isNaN(Number(stock))) product.stock = Number(stock);

  saveProducts(products);
  res.json(product);
});

app.delete("/api/products/:id", requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const products = loadProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) {
    return res.status(404).json({ error: "product not found" });
  }
  saveProducts(filtered);
  res.status(204).send();
});

app.post("/api/orders", requireAuth, (req, res) => {
  const { customerName, phone, address, note = "", items } = req.body || {};

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập tên khách hàng" });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập số điện thoại" });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ error: "Vui lòng nhập địa chỉ giao hàng" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Giỏ hàng đang trống" });
  }

  const products = loadProducts();
  const orderItems = [];

  for (const raw of items) {
    const qty = Number(raw.qty);
    const product = products.find((p) => p.id === Number(raw.id));
    if (!product) {
      return res.status(400).json({ error: `Sản phẩm #${raw.id} không tồn tại` });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: `Số lượng không hợp lệ cho ${product.name}` });
    }
    if (product.stock < qty) {
      return res.status(400).json({ error: `${product.name} chỉ còn ${product.stock} sản phẩm` });
    }
    orderItems.push({ product, qty });
  }

  orderItems.forEach(({ product, qty }) => {
    product.stock -= qty;
  });
  saveProducts(products);

  const total = orderItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  const orders = loadOrders();
  const order = {
    id: nextOrderId(orders),
    username: req.user.username,
    customerName: customerName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    note: note.trim(),
    items: orderItems.map(({ product, qty }) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
    })),
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  saveOrders(orders);

  res.status(201).json(order);
});

app.get("/api/orders", requireAuth, requireAdmin, (req, res) => {
  const orders = loadOrders().sort((a, b) => b.id - a.id);
  res.json(orders);
});

app.patch("/api/orders/:id", requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }

  const orders = loadOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "order not found" });

  order.status = status;
  saveOrders(orders);
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
