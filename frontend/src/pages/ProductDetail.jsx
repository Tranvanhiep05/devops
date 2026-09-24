import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x450?text=No+Image";

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "đ";
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    setProduct(null);
    setQty(1);
    api
      .getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const clampQty = (value) => {
    const max = product?.stock ?? 1;
    return Math.min(Math.max(1, value), Math.max(1, max));
  };

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate("/cart", { state: { openCheckout: true } });
  };

  if (loading) return <p className="detail-status">Đang tải sản phẩm...</p>;
  if (error) return <p className="detail-status error">{error}</p>;
  if (!product) return null;

  const outOfStock = product.stock <= 0;

  return (
    <div className="product-detail">
      <Link to="/" className="back-link">
        ← Quay lại cửa hàng
      </Link>

      <div className="detail-grid">
        <div className="detail-image">
          <img src={product.image || PLACEHOLDER_IMAGE} alt={product.name} />
        </div>

        <div className="detail-info">
          {product.category && <span className="detail-category">{product.category}</span>}
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="detail-desc">{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
          <p className={outOfStock ? "detail-stock out" : "detail-stock"}>
            {outOfStock ? "Hết hàng" : `Còn lại: ${product.stock} sản phẩm`}
          </p>

          {!outOfStock && (
            <div className="qty-control detail-qty">
              <button type="button" onClick={() => setQty((q) => clampQty(q - 1))}>
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => clampQty(q + 1))}>
                +
              </button>
            </div>
          )}

          <div className="detail-actions">
            <button className="add-cart-btn" disabled={outOfStock} onClick={handleAddToCart}>
              {added ? "Đã thêm ✓" : "Thêm vào giỏ"}
            </button>
            <button className="buy-now-btn" disabled={outOfStock} onClick={handleBuyNow}>
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
