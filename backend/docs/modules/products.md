# Product Management Module

> Complete product ecosystem — categories, brands, products, variants, images, inventory, reviews, tags, collections, SEO.

---

## Table of Contents

- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [API Endpoints](#api-endpoints)
- [Product & Variant System](#product--variant-system)
- [Inventory System](#inventory-system)
- [Review System](#review-system)
- [Collections](#collections)
- [Seed Data](#seed-data)

---

## Architecture

The system is built with a **Service Layer** pattern:

```
Controller → Service → Model
```

| Layer | Role |
|-------|------|
| **Controller** | Request validation, response formatting |
| **Service** | Business logic, database transactions |
| **Model** | Eloquent ORM, relationships, scopes |
| **Resource** | JSON transformation for API responses |

### Key Design Decisions

- **Soft deletes** on products (data recovery)
- **Service pattern** keeps controllers thin
- **Computed attributes** on Product model (display_price, is_low_stock, etc.)
- **Eager loading** prevents N+1 queries
- **Transactions** for product create/update (images + variants in one go)
- **Two resources**: `ProductResource` (full detail) and `ProductListResource` (list view)

---

## Database Schema

### `products` table

| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned | PK |
| category_id | bigint unsigned | FK → categories.id |
| brand_id | bigint unsigned | FK → brands.id |
| name | varchar(255) | |
| slug | varchar(255) | unique |
| short_description | varchar(500) | nullable |
| description | longText | nullable |
| sku | varchar(100) | unique, nullable |
| price | decimal(12,2) | default 0 |
| sale_price | decimal(12,2) | nullable |
| cost_price | decimal(12,2) | nullable |
| stock | integer | default 0 |
| low_stock_threshold | integer | default 10 |
| thumbnail | varchar(255) | nullable |
| weight | decimal(10,2) | nullable |
| unit | varchar(20) | nullable |
| status | enum | draft, published, archived |
| featured | boolean | default false |
| is_new | boolean | default false |
| is_trending | boolean | default false |
| is_best_seller | boolean | default false |
| seo_title | varchar(255) | nullable |
| seo_description | text | nullable |
| seo_keywords | text | nullable |
| og_image | varchar(255) | nullable |
| published_at | timestamp | nullable |
| created_by | bigint unsigned | FK → users.id |
| deleted_at | timestamp | soft delete |
| created_at/updated_at | timestamp | |

### `categories` table

| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned | PK |
| parent_id | bigint unsigned | FK → categories.id (self-referencing) |
| name | varchar(255) | |
| slug | varchar(255) | unique |
| image | varchar(255) | nullable |
| banner | varchar(255) | nullable |
| description | text | nullable |
| status | boolean | default true |
| sort_order | integer | default 0 |
| featured | boolean | default false |

### `product_images` table

| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned | PK |
| product_id | bigint unsigned | FK → products.id (cascade) |
| image | varchar(255) | |
| sort_order | integer | for reordering |
| is_primary | boolean | default false |
| variant | varchar(255) | nullable — link to variant |

### `product_variants` table

| Column | Type | Notes |
|--------|------|-------|
| id | bigint unsigned | PK |
| product_id | bigint unsigned | FK → products.id (cascade) |
| sku | varchar(100) | unique, nullable |
| color_id | bigint unsigned | FK → colors.id |
| size_id | bigint unsigned | FK → sizes.id |
| price | decimal(12,2) | nullable — overrides product price |
| sale_price | decimal(12,2) | nullable |
| stock | integer | default 0 — overrides product stock |
| weight | decimal(10,2) | nullable |
| image | varchar(255) | nullable |
| status | boolean | default true |

### Other Tables

| Table | Purpose |
|-------|---------|
| `brands` | Product brands |
| `colors` | Color reference (name + hex_code) |
| `sizes` | Size reference (name + category + sort_order) |
| `tags` | Product tags |
| `product_tag` | Many-to-many pivot |
| `reviews` | Product reviews (user_id, product_id, rating, review, status) |
| `review_images` | Review images |
| `collections` | Product collections (name, slug, type: manual/auto) |
| `collection_product` | Many-to-many pivot |

---

## Backend Structure

```
app/
├── Http/
│   ├── Controllers/API/
│   │   ├── Admin/
│   │   │   ├── ProductController.php       # Admin product CRUD + bulk + duplicate + toggle
│   │   │   ├── CategoryController.php       # Admin category CRUD + tree
│   │   │   ├── BrandController.php          # Brand CRUD
│   │   │   ├── ColorController.php          # Color CRUD
│   │   │   ├── SizeController.php           # Size CRUD
│   │   │   ├── TagController.php            # Tag CRUD
│   │   │   ├── ReviewController.php         # Review list + approve/reject/delete
│   │   │   ├── CollectionController.php     # Collection CRUD
│   │   │   └── DashboardController.php      # Product stats
│   │   └── Public/
│   │       ├── ProductController.php        # Public product listing + detail + featured/trending/new/search
│   │       └── CategoryController.php       # Public category listing + tree
│   └── Resources/
│       ├── ProductResource.php              # Full product detail
│       ├── ProductListResource.php          # Lightweight product list
│       ├── ProductImageResource.php         # Image resource
│       ├── ProductVariantResource.php       # Variant resource
│       ├── CategoryResource.php             # Category resource
│       └── ReviewResource.php               # Review resource
├── Models/
│   ├── Product.php                          # SoftDeletes, HasMany images/variants/reviews
│   ├── ProductImage.php                     # BelongsTo product
│   ├── ProductVariant.php                   # BelongsTo product, color, size
│   ├── Category.php                         # Self-referencing parent/child
│   ├── Brand.php                            # HasMany products
│   ├── Color.php                            # Reference data
│   ├── Size.php                             # Reference data
│   ├── Tag.php                              # BelongsToMany products
│   ├── Review.php                           # BelongsTo user + product, HasMany images
│   ├── ReviewImage.php                      # BelongsTo review
│   └── Collection.php                       # BelongsToMany products
└── Services/
    ├── ProductService.php                   # Product business logic + image/variant sync
    ├── CategoryService.php                  # Category tree + CRUD logic
    └── ReviewService.php                    # Review list + moderation
database/
└── seeders/
    └── ProductSeeder.php                    # Demo data (8 products, variants, categories, etc.)
```

---

## Frontend Structure

```
frontend/src/
├── stores/
│   ├── products.store.js        # Zustand — product CRUD + bulk actions
│   ├── categories.store.js      # Zustand — category CRUD
│   └── reviews.store.js         # Zustand — review list + approve/reject
├── services/admin/
│   └── adminService.js          # All admin API services (products, categories, reviews, etc.)
├── pages/admin/
│   ├── AdminProducts.jsx        # Product listing — search, filter, bulk actions, pagination
│   ├── AdminProductForm.jsx     # Product form — 8 sections (basic, media, pricing, inventory, variants, tags, SEO, status)
│   ├── AdminCategories.jsx      # Category management — modal form, parent select, status toggle
│   ├── AdminInventory.jsx       # Inventory dashboard — stock levels, low stock alerts
│   ├── AdminReviews.jsx         # Review moderation — approve/reject/delete
│   └── AdminCollections.jsx     # Collection management
└── components/admin/
    └── AdminSidebar.jsx         # Sidebar — includes Products, Categories, Inventory, Reviews, Collections
```

---

## API Endpoints

### Public Endpoints (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/categories` | All active categories |
| GET | `/api/public/categories/tree` | Category hierarchy tree |
| GET | `/api/public/categories/featured` | Featured categories |
| GET | `/api/public/categories/{slug}` | Single category by slug |
| GET | `/api/public/products` | Published products (paginated, filterable) |
| GET | `/api/public/products/featured` | Featured products |
| GET | `/api/public/products/trending` | Trending products |
| GET | `/api/public/products/new-arrivals` | New arrivals |
| GET | `/api/public/products/best-sellers` | Best sellers |
| GET | `/api/public/products/related/{id}` | Related products |
| GET | `/api/public/products/search?q=` | Search products |
| GET | `/api/public/products/{slug}` | Single product by slug |

### Admin Endpoints (auth + role required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | Product list (search, filter, sort, paginate) |
| POST | `/api/admin/products` | Create product (with images, variants, tags) |
| GET | `/api/admin/products/{id}` | Full product detail |
| PUT | `/api/admin/products/{id}` | Update product |
| DELETE | `/api/admin/products/{id}` | Soft delete product |
| POST | `/api/admin/products/bulk-action` | Bulk delete/publish/unpublish/feature |
| POST | `/api/admin/products/{id}/duplicate` | Duplicate product |
| PUT | `/api/admin/products/{id}/toggle-featured` | Toggle featured flag |
| PUT | `/api/admin/products/{id}/toggle-status` | Toggle draft/published |
| GET/POST/PUT/DELETE | `/api/admin/categories` | Category CRUD |
| GET | `/api/admin/categories/tree` | Category tree |
| GET/POST/PUT/DELETE | `/api/admin/brands` | Brand CRUD |
| GET/POST/PUT/DELETE | `/api/admin/colors` | Color CRUD |
| GET/POST/PUT/DELETE | `/api/admin/sizes` | Size CRUD |
| GET/POST/DELETE | `/api/admin/tags` | Tag CRUD |
| GET | `/api/admin/reviews` | Review list (filter by status) |
| PUT | `/api/admin/reviews/{id}/approve` | Approve review |
| PUT | `/api/admin/reviews/{id}/reject` | Reject review |
| DELETE | `/api/admin/reviews/{id}` | Delete review |
| GET/POST/PUT/DELETE | `/api/admin/collections` | Collection CRUD |

---

## Product & Variant System

### Variant Generation

Products support **color + size** variant combinations:

```
Product: Silk Maxi Dress
  ├── Pink / S
  ├── Pink / M
  ├── Pink / L
  ├── Beige / S
  ├── Beige / M
  └── Beige / L
```

Each variant has its own:
- SKU
- Price (overrides product price if set)
- Sale price
- Stock
- Status (active/inactive)

### Image System

- Multiple images per product
- One primary (thumbnail) image
- Sortable order
- Optional variant association
- Future: WebP optimization, responsive sizes

---

## Inventory System

### Stock Tracking

- **Product-level stock**: Quick overview
- **Variant-level stock**: Per-variant tracking
- **Low stock threshold**: Configurable per product (default: 10)

### Inventory Statuses

| Status | Condition |
|--------|-----------|
| In Stock | `stock > low_stock_threshold` |
| Low Stock | `0 < stock <= low_stock_threshold` |
| Out of Stock | `stock <= 0` |

### Query Scopes

```php
Product::inStock()      // stock > 0
Product::lowStock()     // 0 < stock <= low_stock_threshold
Product::outOfStock()   // stock <= 0
```

---

## Review System

- Ratings 1–5
- Text reviews
- Optional review images
- **Moderation flow**: Pending → Approved/Rejected
- One review per user per product (unique constraint)

### Review Permissions

| Permission | Description |
|------------|-------------|
| `view reviews` | See review list in admin |
| `approve reviews` | Approve/reject pending reviews |
| `delete reviews` | Delete any review |

---

## Collections

- **Manual**: Admin picks products
- **Auto** (future): Rule-based product selection
- Collections appear on homepage and category pages

---

## Seed Data

Run `php artisan db:seed` to create:

| Data | Count |
|------|-------|
| Brands | 3 (Velisca Luxe, Resin Artistry, Velisca Home) |
| Categories | 9 (4 parents + 5 children) |
| Colors | 10 |
| Sizes | 10 |
| Tags | 8 |
| Products | 8 (with variants and images) |
| Product Variants | ~40+ |
| Product Images | 16 (2 per product) |
