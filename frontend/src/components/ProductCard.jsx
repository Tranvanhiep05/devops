import { Link } from "react-router-dom";
import "./ProductCard.css";

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "đ";
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=No+Image";

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image">
        <img
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.name}
          loading="lazy"
        />
        {product.category && <span className="product-category">{product.category}</span>}
      </Link>
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>
        <p className="product-desc">{product.description}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className="product-stock">Còn lại: {product.stock}</p>
        <button
          disabled={product.stock <= 0}
          onClick={() => onAddToCart(product)}
        >
          {product.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
