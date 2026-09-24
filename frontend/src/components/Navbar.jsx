import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { IconAdmin, IconCart, IconLogout } from "./Icons";
import "./Navbar.css";

function Navbar() {
  const { count } = useCart();
  const { isAuthenticated, isAdmin, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <NavLink to="/" end className="brand">
        TOORA
      </NavLink>
      <div className="nav-links">
        {isAuthenticated && !isAdmin && (
          <>
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
            <NavLink to="/cart" className="cart-link">
              <IconCart className="nav-icon" />
              Giỏ hàng
              {count > 0 && <span className="cart-badge">{count}</span>}
            </NavLink>
          </>
        )}
        {isAuthenticated && isAdmin && (
          <NavLink to="/admin">
            <IconAdmin className="nav-icon" />
            Admin
          </NavLink>
        )}
        {isAuthenticated && (
          <>
            <span className="nav-username">
              {isAdmin ? "Quản trị" : "Khách hàng"}: {username}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              <IconLogout className="nav-icon" />
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
