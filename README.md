s # Clothify

Clothify is a full-stack e-commerce application built with Laravel, Sanctum, Blade, Vite, and Tailwind CSS. It combines a customer-facing storefront with an admin/staff dashboard for managing products, categories, stock, and orders.

The project is designed as an API-first Laravel app: Blade renders the main screens, while modular JavaScript talks to versioned API endpoints under `/api/v1`.

## Preview

Add your screenshots to `docs/screenshots/` and update the image paths below.

| Storefront | Product Management |
| --- | --- |
| <img width="1600" height="815" alt="clothify login pic" src="https://github.com/user-attachments/assets/bc5774fb-18c2-452a-9527-97a85219afef" />

<img width="1600" height="809" alt="clothify storefront" src="https://github.com/user-attachments/assets/07608c15-206c-4218-8af5-06eaf360fa46" />
<img width="1600" height="771" alt="storefront products" src="https://github.com/user-attachments/assets/0a77e6b0-e4f3-47ee-89f4-6b08f1fa5d56" />
<img width="1600" height="779" alt="storefront sd" src="https://github.com/user-attachments/assets/d02b442c-b67f-4ee5-a0b4-bf49ca6f67bd" />
<img width="1600" height="793" alt="storefront darkmode" src="https://github.com/user-attachments/assets/3bf2bfd4-9dc2-4f79-9118-3d67dd2832d5" />
<img width="1600" height="783" alt="storefront darkmode sd" src="https://github.com/user-attachments/assets/a9456ccd-1f4a-4360-9174-42728703b8d5" />




 |<img width="1600" height="808" alt="clothify productspage pic" src="https://github.com/user-attachments/assets/46a22302-429e-4296-b676-bfee19af26d8" />
 |

| Dashboard | Checkout |
| --- | --- |
| <img width="1600" height="810" alt="clothify dashboardpic" src="https://github.com/user-attachments/assets/af328dfb-fefe-4ba4-b33f-8e43f7a92362" />
 |  <img width="1600" height="759" alt="storefront darkmode activecheckout" src="https://github.com/user-attachments/assets/b6be93b8-afae-4842-92cf-db84c5f93766" />
|

## Features

- Customer storefront with product browsing, search, category filtering, price filtering, sorting, pagination, and product detail modals
- Shopping cart drawer with quantity updates and checkout flow
- Delivery checkout fields tailored for Ghana, including region, landmark, and Ghana Post GPS support
- User registration and login with Laravel Sanctum session authentication for the web
- Optional mobile-style token authentication using an `X-Mobile-App` request header
- Role-based access control for admin and staff dashboard routes
- Admin dashboard with total products, total orders, revenue, low-stock counts, low-stock items, and recent orders
- Product management with create, edit, delete, image upload, active/inactive state, categories, and variants
- Stock adjustment endpoint with stock movement history support
- Order management with filters, detail modal, status updates, payment status updates, and deletion
- Docker setup with PHP, Nginx, MySQL, and phpMyAdmin

## Tech Stack

- Backend: Laravel 12, PHP 8.2
- Auth: Laravel Sanctum
- Frontend: Blade, Vite, Tailwind CSS 4, vanilla JavaScript modules
- Database: Mysql
- Tooling: Composer, npm, PHPUnit, Laravel Pint-ready dependencies
- Containers: Docker Compose, Nginx, MySQL 8, phpMyAdmin

## Screens

- `/login` - user login
- `/register` - customer registration
- `/shop` - customer storefront
- `/dashboard` - admin/staff overview dashboard
- `/products` - admin/staff product and variant management
- `/orders` - admin/staff order management

## API Overview

All API routes are versioned under `/api/v1`.

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/register` | Create a customer account |
| `POST` | `/api/v1/login` | Log in with session auth or mobile token auth |
| `GET` | `/api/v1/products` | List products with filters, search, sorting, and pagination |
| `GET` | `/api/v1/products/{product}` | Get product details with category and variants |
| `GET` | `/api/v1/categories` | List product categories |

### Authenticated

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/logout` | Log out current user |
| `GET` | `/api/v1/me` | Get the current user profile |
| `POST` | `/api/v1/orders` | Place a customer order |

### Admin / Staff

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/stats` | Dashboard metrics |
| `POST` | `/api/v1/products` | Create a product |
| `PUT` | `/api/v1/products/{product}` | Update a product |
| `DELETE` | `/api/v1/products/{product}` | Delete a product |
| `POST` | `/api/v1/products/{product}/adjust-stock` | Adjust stock and log movement |
| `POST` | `/api/v1/product-variants` | Create a product variant |
| `POST` | `/api/v1/categories` | Create a category |
| `DELETE` | `/api/v1/categories/{category}` | Delete a category |
| `GET` | `/api/v1/orders` | List orders |
| `GET` | `/api/v1/orders/{order}` | View an order |
| `PATCH` | `/api/v1/orders/{order}/status` | Update order status |
| `PATCH` | `/api/v1/orders/{order}/payment-status` | Update payment status |
| `DELETE` | `/api/v1/orders/{order}` | Delete an order |

## Getting Started

### Requirements

- PHP 8.2 or higher
- Composer
- Node.js and npm
- SQLite or MySQL
- Docker Desktop, if using the container setup

### Local Setup

Clone the repository and install dependencies:

```bash
composer install
npm install
```

Create the environment file and application key:

```bash
cp .env.example .env
php artisan key:generate
```

Create the SQLite database if you are using the default `.env.example` database settings:

```bash
touch database/database.sqlite
```

Run migrations:

```bash
php artisan migrate
```

Link public storage for product images:

```bash
php artisan storage:link
```

Start the app:

```bash
composer run dev
```

The Laravel server will run at `http://127.0.0.1:8000` and Vite will serve frontend assets.

### Docker Setup

Start the containers:

```bash
docker compose up -d --build
```

The app will be available at:

- App: `http://localhost:8000`
- phpMyAdmin: `http://localhost:8080`
- MySQL host port: `3307`

For Docker, use MySQL settings similar to:

```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=ecommerce
DB_USERNAME=root
DB_PASSWORD=secret
```

Then run migrations inside the app container:

```bash
docker compose exec app php artisan migrate
docker compose exec app php artisan storage:link
```

## Admin Account

The project includes an `AdminSeeder` that reads credentials from `.env`.

```env
ADMIN_NAME="Admin User"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="use-a-strong-password"
```

The admin password must be at least 12 characters. After adding the values, run:

```bash
php artisan db:seed --class=AdminSeeder
```

or, with Docker:

```bash
docker compose exec app php artisan db:seed --class=AdminSeeder
```

After the first login, remove `ADMIN_PASSWORD` from `.env`.

## Project Structure

```text
app/Http/Controllers/API/V1   Versioned API controllers
app/Http/Middleware           Role-based access middleware
app/Models                    Eloquent models for users, products, orders, variants, categories, and stock
database/migrations           Database schema
database/seeders              Seeders, including admin user setup
resources/views               Blade pages and layout components
resources/js                  Modular frontend JavaScript
resources/css                 Tailwind and storefront styling
routes/api.php                API routes
routes/web.php                Blade page routes
docker/                       PHP and Nginx container config
```

## Testing

Run the test suite:

```bash
composer test
```

Build frontend assets:

```bash
npm run build
```

## Portfolio Notes

To make the repository presentation stronger, add:

- A hero screenshot of the storefront above the fold
- A product grid screenshot showing filters and product cards
- A cart or checkout modal screenshot
- An admin dashboard screenshot with populated stats
- A product management screenshot showing image upload, categories, and variants
- A short demo GIF or screen recording linked near the top

Recommended screenshot paths:

```text
docs/screenshots/storefront.png
docs/screenshots/products.png
docs/screenshots/dashboard.png
docs/screenshots/checkout.png
```

## License

This project is open-source under the MIT license.
