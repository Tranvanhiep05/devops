# Shop Demo - CI/CD Demo (Docker & GitHub Actions)

## Đã deploy

- Frontend: https://shop-frontend-latest-kr2v.onrender.com
- Backend API: https://shop-backend-latest.onrender.com

Trang web bán hàng đơn giản, gồm 2 phần, dùng làm nền để thực hành CI/CD với Docker & GitHub Actions:

- `backend/` — Node.js + Express, REST API quản lý sản phẩm (lưu ở file JSON).
- `frontend/` — React + Vite, có trang bán hàng (xem sản phẩm, giỏ hàng) và trang Admin (thêm/sửa/xoá sản phẩm).

## Chạy local

### Backend
```
cd backend
npm install
npm run dev
```
Backend chạy ở `http://localhost:5000`.

### Frontend
```
cd frontend
cp .env.example .env   # chỉ cần làm 1 lần
npm install
npm run dev
```
Frontend chạy ở `http://localhost:5173`, gọi API qua biến môi trường `VITE_API_URL` trong `frontend/.env` (mặc định `http://localhost:5000` nếu không có file `.env`).

## Trang web

- `/` — Trang chủ: hiển thị danh sách sản phẩm, thêm vào giỏ hàng.
- `/cart` — Giỏ hàng: xem sản phẩm đã thêm, tổng tiền (giỏ hàng chỉ lưu tạm trên trình duyệt, chưa có thanh toán thật).
- `/login` — Đăng nhập admin.
- `/admin` — Trang quản trị (yêu cầu đăng nhập): thêm, sửa, xoá sản phẩm.

Tài khoản admin mặc định: **admin / admin123** (đổi qua biến môi trường `ADMIN_USERNAME`, `ADMIN_PASSWORD` ở backend — xem `docker-compose.yml`).

## Chạy bằng Docker

```
docker compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

Dừng:
```
docker compose down
```

## API

| Method | Endpoint             | Mô tả                              |
|--------|----------------------|-------------------------------------|
| GET    | /health              | Kiểm tra server sống                |
| GET    | /api/products        | Lấy danh sách sản phẩm              |
| GET    | /api/products/:id    | Lấy chi tiết 1 sản phẩm             |
| POST   | /api/products        | Thêm sản phẩm `{name,price,description,image,stock}` |
| PUT    | /api/products/:id    | Cập nhật sản phẩm                   |
| DELETE | /api/products/:id    | Xoá sản phẩm                        |

Dữ liệu sản phẩm lưu tại `backend/src/data/products.json`.

## CI/CD (GitHub Actions)

File `.github/workflows/deploy.yml` sẽ tự động build & push 2 image (`shop-backend`, `shop-frontend`) lên Docker Hub mỗi khi push code lên nhánh `main`.

**Workflow sẽ fail ở bước "Login to Docker Hub" cho tới khi bạn thêm Secrets** (đây là nguyên nhân báo lỗi "Username and password required"). Cách sửa:

1. Tạo Access Token trên Docker Hub: đăng nhập [hub.docker.com](https://hub.docker.com/) → **Account Settings → Personal access tokens → Generate new token** → copy token (chỉ hiện 1 lần).
2. Vào GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, thêm:

   | Loại     | Tên                | Giá trị |
   |----------|--------------------|---------|
   | Secret   | `DOCKER_USERNAME`  | Username Docker Hub |
   | Secret   | `DOCKER_PASSWORD`  | Access Token vừa tạo ở bước 1 (không dùng mật khẩu đăng nhập thường) |
   | Variable | `VITE_API_URL`     | `https://shop-backend-latest.onrender.com` (URL backend đã deploy ở trên), dùng để build frontend trỏ đúng API |

3. Vào tab **Actions** → chọn workflow bị fail → **Re-run all jobs**, hoặc push thêm 1 commit mới để chạy lại.

## Deploy lên Render

1. Đăng ký/đăng nhập [Render](https://dashboard.render.com/).
2. Tạo **Web Service** mới cho backend: chọn "Deploy an existing image from a registry", nhập image `<docker-username>/shop-backend:latest`.
3. Tạo thêm **Web Service** cho frontend tương tự với image `<docker-username>/shop-frontend:latest`.
4. Lấy URL backend Render vừa tạo, cập nhật vào GitHub Actions variable `VITE_API_URL` ở trên rồi push lại code để build frontend đúng địa chỉ API.
5. Ở gói miễn phí, service sẽ ngủ khi không có truy cập — lần đầu mở lại sẽ mất chút thời gian để "thức dậy".

## Kiểm tra pipeline

Sau khi thêm Secrets, push code mới lên `main` rồi vào tab **Actions** trên GitHub để xem workflow chạy:
```
git add .
git commit -m "update app"
git push
```
