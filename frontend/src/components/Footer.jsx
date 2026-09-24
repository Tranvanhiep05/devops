import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      {/* ================================
          THÔNG TIN FOOTER
      ================================= */}
      <div className="footer-content">

        <h2>LIÊN HỆ VỚI TOORA</h2>

        <div className="footer-info">
          <p>Add: 11 Phú Xuân 3 - Hoà Minh - Liên Chiểu - Đà Nẵng</p>
          <p>Mail: dongphuctoora@gmail.com</p>
          <p>Hotline: 0914 57 22 55</p>
        </div>

        {/* Danh mục */}
        <div className="footer-links">

          <div className="footer-column">
            <a href="#">❤️ Đồng phục công sở</a>
            <a href="#">❤️ Đồng phục bếp</a>
          </div>

          <div className="footer-column">
            <a href="#">❤️ Đồng phục học đường</a>
            <a href="#">❤️ Đồng phục nhà hàng</a>
          </div>

          <div className="footer-column">
            <a href="#">❤️ Đồng phục gia đình</a>
            <a href="#">❤️ Đồng phục Teambuilding</a>
          </div>

          <div className="footer-column">
            <a href="#">❤️ Đồng phục polo</a>
            <a href="#">❤️ Đồng phục bảo vệ</a>
          </div>

        </div>

      </div>

      {/* ================================
          COPYRIGHT
      ================================= */}
      <div className="footer-bottom">
        Copyright © 2025 đồng phục Toora. All Rights Reserved |
        Design by Vietstar media
      </div>

      {/* ================================
          NÚT LIÊN HỆ NỔI
      ================================= */}
      <div className="floating-contact">

        <a
          href="tel:0914572255"
          className="floating-phone"
          aria-label="Gọi điện"
        >
          ☎
        </a>

        <a
          href="#"
          className="floating-zalo"
          aria-label="Zalo"
        >
          <span>Zalo</span>
        </a>

      </div>

    </footer>
  );
}

export default Footer;