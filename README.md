# FoodStore — Food Selling E-Commerce MVP (No Delivery)

**Developed by Aoi Ashito**

A single-seller food ordering app: customers browse, add to cart, and place orders for pickup.
Admins manage categories, food items (with image upload), orders, and customer accounts.

## Stack

- **Backend:** Java 17, Spring Boot 3 (Web, Data JPA, Security, Validation), plain POJOs (no Lombok)
- **Frontend:** HTML + vanilla JavaScript + Tailwind CSS (via CDN)
- **Database:** MySQL
- **Auth:** JWT, BCrypt password hashing, role-based access (`CUSTOMER` / `ADMIN`)
- **Build tool:** Maven

## Project layout

```
food-store-app/
  backend/    Spring Boot app (REST API + frontend)
    src/main/resources/static/   HTML/JS/Tailwind pages (served by Spring Boot)
  db/         schema.sql (tables + seed data)
```

## 1. MySQL setup

Create the database and tables, and load seed data:

```
mysql -u root -p < db/schema.sql
```

This creates the `food_store` database with all tables, a seeded admin account, 4 categories,
and 8 sample food items.

**Seeded admin login:** `admin@foodstore.com` / `Admin@123`

If your MySQL username/password differ from `root`/`root`, update
`backend/src/main/resources/application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/food_store...
spring.datasource.username=root
spring.datasource.password=root
```

## 2. Run the app

Requires JDK 17+ and Maven. One command runs everything — Spring Boot serves both the REST
API and the website from `src/main/resources/static`:

```
cd backend
mvn spring-boot:run
```

Then open **http://localhost:8090** in your browser.

Uploaded food images are stored in `backend/uploads/` and served at
`http://localhost:8090/uploads/<filename>`.

> Note: the port is 8090 (not 8080) because Windows often reserves the 8080 range.
> Change it in `application.properties` (`server.port`) if you like.

## API overview

| Area       | Endpoint                                | Auth        |
|------------|------------------------------------------|-------------|
| Auth       | `POST /api/auth/register`, `/login`      | Public      |
| Categories | `GET /api/categories`                    | Public      |
| Categories | `POST/PUT/DELETE /api/admin/categories`  | Admin       |
| Food items | `GET /api/food-items`, `/food-items/{id}`| Public      |
| Food items | `POST/PUT/DELETE /api/admin/food-items`  | Admin (multipart, `image` file field) |
| Cart       | `GET/POST /api/cart`, `/cart/items/**`   | Customer    |
| Orders     | `POST/GET /api/orders`                   | Customer    |
| Orders     | `GET /api/admin/orders`, `PUT .../status`| Admin       |
| Users      | `GET/PUT /api/users/me`                  | Any user    |
| Users      | `GET /api/admin/users`, `PUT .../status` | Admin       |

All authenticated requests need `Authorization: Bearer <token>`, where `<token>` is returned
from `/api/auth/login` or `/api/auth/register`.

## Notes

- Image uploads accept JPG/PNG only, max 5MB, validated server-side.
- `schema.sql` is the source of truth for the DB schema; JPA's `ddl-auto` is set to `none`.
- CORS is open (`*`) for local development — tighten `SecurityConfig.corsConfigurationSource()`
  before deploying anywhere public.
