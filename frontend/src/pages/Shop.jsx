import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import "./Shop.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const { addItem } = useCart();

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["Tất cả", ...set];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q);

      const matchesCategory =
        category === "Tất cả" || p.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  if (loading) {
    return <p className="shop-status">Đang tải sản phẩm...</p>;
  }

  if (error) {
    return <p className="shop-status error">{error}</p>;
  }

  return (
    <div className="shop">

      {/* ================================
          BANNER
      ================================= */}
      <div className="hero-banner">
        <img
          src="/slideshow_3-6754.png"
          alt="Banner cửa hàng"
        />
      </div>


      {/* ================================
          GIỚI THIỆU
      ================================= */}
      <section className="about-section">

        <div className="about-image">
          <img
            src="/anhco.jpg"
            alt="Giới thiệu TOORA"
          />
        </div>

        <div className="about-content">

          <span className="about-small-title">
            VỀ CHÚNG TÔI
          </span>

          <h2>ĐỒNG PHỤC TOORA</h2>

          <p>
            Xưởng may TOORA là một xưởng may chuyên thiết kế,
            may mặc, in ấn tất cả các sản phẩm về thời trang
            thuộc dòng áo đồng phục. Bên cạnh chất lượng sản
            phẩm là chất liệu vải, đường kim mũi chỉ thì việc
            luôn sáng tạo ra các mẫu thiết kế nhằm cải thiện
            tính thời trang cao như hiện nay là điều hết sức
            cần lưu tâm.
          </p>

          <p>
            Với hệ thống nhiều xưởng may, đội ngũ nhân viên
            kỹ thuật được đào tạo qua các lớp trường chuyên
            về kỹ thuật may mặc chính vì vậy mà xưởng may
            áo đồng phục luôn cho ra đời các loại mẫu mã
            sản phẩm tốt cả về chất lượng lẫn thời trang.
          </p>

          <p className="about-highlight">
            Sản phẩm ĐẸP - Giá Thành HỢP LÝ
          </p>

          <p className="about-highlight">
            Luôn chú trọng chất lượng - Chất lượng là hàng đầu
          </p>

          <a href="#" className="about-button">
            Xem chi tiết
          </a>

        </div>

      </section>


      {/* ================================
          TÌM KIẾM + DANH MỤC
      ================================= */}
      <div className="shop-toolbar">

        <input
          type="search"
          placeholder="Tìm sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="category-chips">

          {categories.map((c) => (
            <button
              key={c}
              className={
                c === category
                  ? "chip active"
                  : "chip"
              }
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}

        </div>

      </div>


      {/* ================================
          DANH SÁCH SẢN PHẨM
      ================================= */}
      {filtered.length === 0 ? (

        <p className="shop-status">
          Không tìm thấy sản phẩm phù hợp.
        </p>

      ) : (

        <div className="product-grid">

          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={addItem}
            />
          ))}

        </div>

      )}


      {/* ================================
          VÌ SAO ĐẶT IN ĐỒNG PHỤC TOORA
      ================================= */}
      <section className="why-toora">

        {/* ẢNH BÊN TRÁI */}
        <div className="why-toora-image">

          <img
            src="/banner_giadinh.png"
            alt="Đồng phục TOORA"
          />

        </div>


        {/* NỘI DUNG BÊN PHẢI */}
        <div className="why-toora-content">

          <h2>
            Vì sao đặt in đồng phục tại TOORA ?
          </h2>


          <div className="why-toora-grid">

            {/* Ô 1 */}
            <div className="why-item">

              <div className="why-icon">
                ✣
              </div>

              <h3>
                Thiết kế miễn phí
              </h3>

              <p>
                Thiết kế logo, hình in miễn phí
              </p>

            </div>


            {/* Ô 2 */}
            <div className="why-item">

              <div className="why-icon">
                ↶
              </div>

              <h3>
                Đổi trả trong 15 ngày
              </h3>

              <p>
                Miễn phí nếu có lỗi từ nhà sản xuất
              </p>

            </div>


            {/* Ô 3 */}
            <div className="why-item">

              <div className="why-icon">
                ▦
              </div>

              <h3>
                Bảo hành 6 tháng
              </h3>

              <p>
                Bảo hành chất lượng in/thêu
              </p>

            </div>


            {/* Ô 4 */}
            <div className="why-item">

              <div className="why-icon">
                🚚
              </div>

              <h3>
                Miễn phí giao hàng
              </h3>

              <p>
                Giao hàng toàn quốc
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Shop;