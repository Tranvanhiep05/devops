import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import {
  IconAlert,
  IconClock,
  IconEdit,
  IconPackage,
  IconPlus,
  IconReceipt,
  IconTrash,
  IconWallet,
} from "../components/Icons";
import "./Admin.css";

const emptyForm = { name: "", price: "", description: "", image: "", stock: "", category: "" };
const PLACEHOLDER_IMAGE = "https://placehold.co/100x100?text=No+Image";
const LOW_STOCK_THRESHOLD = 8;
const ORDER_STATUSES = ["pending", "confirmed", "shipping", "completed", "cancelled"];
const STATUS_LABELS = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
};
const SECTIONS = [
  { key: "products", label: "Sản phẩm", icon: IconPackage },
  { key: "orders", label: "Đơn hàng", icon: IconReceipt },
];

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "đ";
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("vi-VN");
}

function Admin() {
  const [section, setSection] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = (err) => {
    if (err.status === 401) {
      logout();
      navigate("/login", { state: { from: "/admin" } });
      return true;
    }
    return false;
  };

  const loadAll = () => {
    setLoading(true);
    setError("");
    Promise.all([api.getProducts(), api.getOrders()])
      .then(([p, o]) => {
        setProducts(p);
        setOrders(o);
      })
      .catch((err) => {
        if (!handleAuthError(err)) setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const stats = useMemo(() => {
    const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    return {
      totalProducts: products.length,
      lowStock,
      totalOrders: orders.length,
      pendingOrders,
      revenue,
    };
  }, [products, orders]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description || "",
      image: product.image || "",
      stock: String(product.stock ?? 0),
      category: product.category || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) return setFormError("Tên sản phẩm không được để trống");
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) return setFormError("Giá không hợp lệ");

    const payload = {
      name: form.name,
      price,
      description: form.description,
      image: form.image,
      stock: Number(form.stock) || 0,
      category: form.category,
    };

    try {
      if (editingId) {
        const updated = await api.updateProduct(editingId, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await api.createProduct(payload);
        setProducts((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      if (!handleAuthError(err)) setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xoá sản phẩm này?")) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await api.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    }
  };

  return (
    <div className="admin">
      <h1>Quản trị cửa hàng</h1>

      <div className="admin-layout">
        <nav className="admin-nav">
          <p className="admin-nav-title">Quản lý</p>
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={section === key ? "active" : ""}
              onClick={() => setSection(key)}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>

        <div className="admin-main">
          {error && <p className="admin-error">{error}</p>}

          {section === "products" ? (
            <>
              <div className="section-header">
                <h2>
                  <IconPackage /> Sản phẩm
                </h2>
                <button className="primary-btn" onClick={openCreateForm}>
                  <IconPlus /> Thêm sản phẩm
                </button>
              </div>

              {loading ? (
                <p>Đang tải...</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tên</th>
                      <th>Danh mục</th>
                      <th>Giá</th>
                      <th>Tồn kho</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className={p.stock <= LOW_STOCK_THRESHOLD ? "low-stock-row" : ""}>
                        <td>
                          <img src={p.image || PLACEHOLDER_IMAGE} alt={p.name} />
                        </td>
                        <td>{p.name}</td>
                        <td>{p.category || "—"}</td>
                        <td>{formatPrice(p.price)}</td>
                        <td>
                          {p.stock}
                          {p.stock <= LOW_STOCK_THRESHOLD && <IconAlert className="stock-warn" />}
                        </td>
                        <td className="admin-actions">
                          <button onClick={() => openEditForm(p)}>
                            <IconEdit /> Sửa
                          </button>
                          <button className="danger" onClick={() => handleDelete(p.id)}>
                            <IconTrash /> Xoá
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              <div className="section-header">
                <h2>
                  <IconReceipt /> Đơn hàng
                </h2>
              </div>

              {loading ? (
                <p>Đang tải...</p>
              ) : orders.length === 0 ? (
                <p>Chưa có đơn hàng nào.</p>
              ) : (
                <div className="order-list">
                  {orders.map((o) => (
                    <div key={o.id} className="order-card">
                      <div className="order-card-header">
                        <div>
                          <strong>Đơn #{o.id}</strong> · {formatDate(o.createdAt)}
                        </div>
                        <select
                          value={o.status}
                          className={`status-select status-${o.status}`}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="order-customer">
                        <span>{o.customerName}</span>
                        <span>{o.phone}</span>
                        <span>{o.address}</span>
                        {o.note && <span>Ghi chú: {o.note}</span>}
                      </div>
                      <ul className="order-items">
                        {o.items.map((it) => (
                          <li key={it.id}>
                            {it.name} × {it.qty} — {formatPrice(it.price * it.qty)}
                          </li>
                        ))}
                      </ul>
                      <div className="order-total">Tổng: {formatPrice(o.total)}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <aside className="admin-sidebar">
          <div className="stat-grid">
            <div className="stat-card">
              <IconPackage className="stat-icon" />
              <div>
                <span className="stat-value">{stats.totalProducts}</span>
                <span className="stat-label">Sản phẩm</span>
              </div>
            </div>
            <div className="stat-card">
              <IconReceipt className="stat-icon" />
              <div>
                <span className="stat-value">{stats.totalOrders}</span>
                <span className="stat-label">Đơn hàng</span>
              </div>
            </div>
            <div className="stat-card">
              <IconWallet className="stat-icon" />
              <div>
                <span className="stat-value">{formatPrice(stats.revenue)}</span>
                <span className="stat-label">Doanh thu</span>
              </div>
            </div>
            <div className="stat-card warn">
              <IconAlert className="stat-icon" />
              <div>
                <span className="stat-value">{stats.lowStock.length}</span>
                <span className="stat-label">Sắp hết hàng</span>
              </div>
            </div>
          </div>

          <div className="sidebar-panel">
            <h3>
              <IconAlert className="panel-icon" /> Sắp hết hàng
            </h3>
            {stats.lowStock.length === 0 ? (
              <p className="panel-empty">Kho hàng đang ổn định.</p>
            ) : (
              <ul className="sidebar-list">
                {stats.lowStock.map((p) => (
                  <li key={p.id}>
                    <span>{p.name}</span>
                    <span className="badge-danger">{p.stock} còn lại</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sidebar-panel">
            <h3>
              <IconClock className="panel-icon" /> Đơn chờ xử lý
            </h3>
            {stats.pendingOrders.length === 0 ? (
              <p className="panel-empty">Không có đơn nào đang chờ.</p>
            ) : (
              <ul className="sidebar-list">
                {stats.pendingOrders.slice(0, 6).map((o) => (
                  <li key={o.id}>
                    <span>#{o.id} · {o.customerName}</span>
                    <span className="badge-muted">{formatPrice(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {showForm && (
        <Modal title={editingId ? `Sửa sản phẩm #${editingId}` : "Thêm sản phẩm mới"} onClose={closeForm}>
          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Tên sản phẩm
              <input
                type="text"
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label>
                Giá (đ)
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label>
                Tồn kho
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </label>
            </div>
            <label>
              Danh mục
              <input
                type="text"
                placeholder="VD: Thời trang, Điện tử..."
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </label>
            <label>
              Ảnh (URL)
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </label>
            <label>
              Mô tả
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            {formError && <p className="admin-error">{formError}</p>}

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? (
                  <>
                    <IconEdit /> Lưu thay đổi
                  </>
                ) : (
                  <>
                    <IconPlus /> Thêm sản phẩm
                  </>
                )}
              </button>
              <button type="button" onClick={closeForm}>
                Huỷ
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Admin;
