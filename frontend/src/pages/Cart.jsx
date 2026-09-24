import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api";
import "./Cart.css";

const PLACEHOLDER_IMAGE = "https://placehold.co/100x100?text=No+Image";
const emptyForm = { customerName: "", phone: "", address: "", note: "" };

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "đ";
}

function Cart() {
  const { items, removeItem, setQty, clear, total } = useCart();
  const location = useLocation();
  const [showCheckout, setShowCheckout] = useState(Boolean(location.state?.openCheckout));
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const navigate = useNavigate();

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.customerName.trim()) return setError("Vui lòng nhập họ tên");
    if (!form.phone.trim()) return setError("Vui lòng nhập số điện thoại");
    if (!form.address.trim()) return setError("Vui lòng nhập địa chỉ giao hàng");

    setSubmitting(true);
    try {
      const order = await api.createOrder({
        ...form,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      });
      setOrderDone(order);
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderDone) {
    return (
      <div className="cart">
        <div className="order-success">
          <h1>Đặt hàng thành công!</h1>
          <p>
            Cảm ơn <strong>{orderDone.customerName}</strong>, đơn hàng{" "}
            <strong>#{orderDone.id}</strong> của bạn đã được ghi nhận.
          </p>
          <p>Tổng tiền: <strong>{formatPrice(orderDone.total)}</strong></p>
          <button onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart">
        <h1>Giỏ hàng</h1>
        <p>Giỏ hàng đang trống.</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Giỏ hàng</h1>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id}>
            <img src={item.image || PLACEHOLDER_IMAGE} alt={item.name} />
            <div className="cart-item-info">
              <span>{item.name}</span>
              <span className="cart-item-price">{formatPrice(item.price)}</span>
            </div>
            <div className="qty-control">
              <button type="button" onClick={() => setQty(item.id, item.qty - 1)}>
                −
              </button>
              <span>{item.qty}</span>
              <button type="button" onClick={() => setQty(item.id, item.qty + 1)}>
                +
              </button>
            </div>
            <span className="cart-line-total">{formatPrice(item.price * item.qty)}</span>
            <button className="remove-btn" onClick={() => removeItem(item.id)}>
              Xoá
            </button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <strong>Tổng cộng: {formatPrice(total)}</strong>
        <div className="cart-actions">
          <button onClick={clear}>Xoá giỏ hàng</button>
          <button className="checkout" onClick={() => setShowCheckout((v) => !v)}>
            {showCheckout ? "Đóng" : "Thanh toán"}
          </button>
        </div>
      </div>

      {showCheckout && (
        <form className="checkout-form" onSubmit={handleCheckout}>
          <h2>Thông tin giao hàng</h2>
          <label>
            Họ tên
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </label>
          <label>
            Số điện thoại
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Địa chỉ giao hàng
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label>
            Ghi chú (không bắt buộc)
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>
          {error && <p className="checkout-error">{error}</p>}
          <button type="submit" className="place-order" disabled={submitting}>
            {submitting ? "Đang đặt hàng..." : `Đặt hàng · ${formatPrice(total)}`}
          </button>
        </form>
      )}
    </div>
  );
}

export default Cart;
