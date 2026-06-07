<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Size;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // ========== Brands ==========
        $brandsData = [
            ['name' => 'Velisca Luxe', 'slug' => 'velisca-luxe', 'description' => 'Premium luxury fashion'],
            ['name' => 'Resin Artistry', 'slug' => 'resin-artistry', 'description' => 'Handcrafted resin art'],
            ['name' => 'Velisca Home', 'slug' => 'velisca-home', 'description' => 'Home decor collection'],
        ];
        foreach ($brandsData as $brand) {
            Brand::firstOrCreate(['slug' => $brand['slug']], $brand);
        }

        // ========== Colors ==========
        $colorsData = [
            ['name' => 'Pink', 'hex_code' => '#FF69B4'],
            ['name' => 'Beige', 'hex_code' => '#F5F5DC'],
            ['name' => 'Black', 'hex_code' => '#000000'],
            ['name' => 'White', 'hex_code' => '#FFFFFF'],
            ['name' => 'Red', 'hex_code' => '#FF0000'],
            ['name' => 'Blue', 'hex_code' => '#0000FF'],
            ['name' => 'Green', 'hex_code' => '#008000'],
            ['name' => 'Gold', 'hex_code' => '#FFD700'],
            ['name' => 'Silver', 'hex_code' => '#C0C0C0'],
            ['name' => 'Purple', 'hex_code' => '#800080'],
        ];
        foreach ($colorsData as $color) {
            Color::firstOrCreate(['name' => $color['name']], $color);
        }

        // ========== Sizes ==========
        $sizesData = [
            ['name' => 'XS', 'category' => 'clothing', 'sort_order' => 1],
            ['name' => 'S', 'category' => 'clothing', 'sort_order' => 2],
            ['name' => 'M', 'category' => 'clothing', 'sort_order' => 3],
            ['name' => 'L', 'category' => 'clothing', 'sort_order' => 4],
            ['name' => 'XL', 'category' => 'clothing', 'sort_order' => 5],
            ['name' => 'XXL', 'category' => 'clothing', 'sort_order' => 6],
            ['name' => 'One Size', 'category' => 'general', 'sort_order' => 7],
            ['name' => 'Small', 'category' => 'home', 'sort_order' => 1],
            ['name' => 'Medium', 'category' => 'home', 'sort_order' => 2],
            ['name' => 'Large', 'category' => 'home', 'sort_order' => 3],
        ];
        foreach ($sizesData as $size) {
            Size::firstOrCreate(['name' => $size['name']], $size);
        }

        // ========== Tags ==========
        $tagsData = ['Trending', 'New Arrival', 'Best Seller', 'Limited Edition', 'Handmade', 'Eco-Friendly', 'Premium', 'Sale'];
        foreach ($tagsData as $tag) {
            Tag::firstOrCreate(['slug' => str($tag)->slug()], ['name' => $tag, 'slug' => str($tag)->slug()]);
        }

        // ========== Categories ==========
        $fashion = Category::firstOrCreate(['slug' => 'fashion'], ['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Clothing and apparel', 'featured' => true, 'sort_order' => 1]);
        $resinArt = Category::firstOrCreate(['slug' => 'resin-art'], ['name' => 'Resin Art', 'slug' => 'resin-art', 'description' => 'Handcrafted resin artwork', 'featured' => true, 'sort_order' => 2]);
        $accessories = Category::firstOrCreate(['slug' => 'accessories'], ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Fashion accessories', 'featured' => true, 'sort_order' => 3]);
        $homeDecor = Category::firstOrCreate(['slug' => 'home-decor'], ['name' => 'Home Decor', 'slug' => 'home-decor', 'description' => 'Home decoration items', 'featured' => true, 'sort_order' => 4]);

        Category::firstOrCreate(['slug' => 'kurtis'], ['name' => 'Kurtis', 'slug' => 'kurtis', 'parent_id' => $fashion->id, 'sort_order' => 1]);
        Category::firstOrCreate(['slug' => 'dresses'], ['name' => 'Dresses', 'slug' => 'dresses', 'parent_id' => $fashion->id, 'sort_order' => 2]);
        Category::firstOrCreate(['slug' => 'tops'], ['name' => 'Tops', 'slug' => 'tops', 'parent_id' => $fashion->id, 'sort_order' => 3]);
        Category::firstOrCreate(['slug' => 'bottoms'], ['name' => 'Bottoms', 'slug' => 'bottoms', 'parent_id' => $fashion->id, 'sort_order' => 4]);
        Category::firstOrCreate(['slug' => 'sarees'], ['name' => 'Sarees', 'slug' => 'sarees', 'parent_id' => $fashion->id, 'sort_order' => 5]);

        // ========== Products ==========
        $products = [
            [
                'name' => 'Crystal Resin Vase',
                'slug' => 'crystal-resin-vase',
                'category_slug' => 'resin-art',
                'brand' => 'Resin Artistry',
                'price' => 2499,
                'sale_price' => 1999,
                'stock' => 23,
                'description' => 'Handcrafted crystal resin vase with embedded natural elements. Each piece is unique.',
                'short_description' => 'Handcrafted crystal resin vase',
                'status' => 'published',
                'featured' => true,
                'is_new' => false,
                'is_trending' => true,
                'is_best_seller' => true,
                'tags' => ['Best Seller', 'Handmade', 'Premium'],
            ],
            [
                'name' => 'Silk Maxi Dress',
                'slug' => 'silk-maxi-dress',
                'category_slug' => 'dresses',
                'brand' => 'Velisca Luxe',
                'price' => 8999,
                'sale_price' => 6999,
                'stock' => 12,
                'description' => 'Elegant silk maxi dress perfect for evening occasions. Features a flowing silhouette.',
                'short_description' => 'Elegant silk maxi dress',
                'status' => 'published',
                'featured' => true,
                'is_new' => true,
                'is_trending' => true,
                'is_best_seller' => false,
                'tags' => ['New Arrival', 'Trending', 'Premium'],
            ],
            [
                'name' => 'Boho Tassel Earrings',
                'slug' => 'boho-tassel-earrings',
                'category_slug' => 'accessories',
                'brand' => 'Velisca Luxe',
                'price' => 1299,
                'stock' => 45,
                'description' => 'Handmade boho-style tassel earrings with gold-plated hooks.',
                'short_description' => 'Handmade boho tassel earrings',
                'status' => 'published',
                'featured' => false,
                'is_new' => true,
                'is_trending' => false,
                'is_best_seller' => false,
                'tags' => ['New Arrival', 'Handmade'],
            ],
            [
                'name' => 'Handmade Ceramic Mug',
                'slug' => 'handmade-ceramic-mug',
                'category_slug' => 'home-decor',
                'brand' => 'Velisca Home',
                'price' => 899,
                'stock' => 0,
                'description' => 'Hand-thrown ceramic mug with natural glaze. Microwave and dishwasher safe.',
                'short_description' => 'Hand-thrown ceramic mug',
                'status' => 'published',
                'featured' => false,
                'is_new' => false,
                'is_trending' => false,
                'is_best_seller' => false,
                'tags' => ['Handmade', 'Eco-Friendly'],
            ],
            [
                'name' => 'Leather Tote Bag',
                'slug' => 'leather-tote-bag',
                'category_slug' => 'accessories',
                'brand' => 'Velisca Luxe',
                'price' => 7999,
                'sale_price' => 6499,
                'stock' => 8,
                'description' => 'Premium leather tote bag with ample storage. Perfect for daily use.',
                'short_description' => 'Premium leather tote bag',
                'status' => 'published',
                'featured' => true,
                'is_new' => false,
                'is_trending' => false,
                'is_best_seller' => true,
                'tags' => ['Best Seller', 'Premium'],
            ],
            [
                'name' => 'Wool Blend Scarf',
                'slug' => 'wool-blend-scarf',
                'category_slug' => 'accessories',
                'brand' => 'Velisca Luxe',
                'price' => 2499,
                'stock' => 18,
                'description' => 'Luxurious wool blend scarf with subtle pattern. Keeps you warm and stylish.',
                'short_description' => 'Luxurious wool blend scarf',
                'status' => 'published',
                'featured' => false,
                'is_new' => false,
                'is_trending' => false,
                'is_best_seller' => false,
                'tags' => ['Premium'],
            ],
            [
                'name' => 'Resin Art Wall Panel',
                'slug' => 'resin-art-wall-panel',
                'category_slug' => 'resin-art',
                'brand' => 'Resin Artistry',
                'price' => 5999,
                'stock' => 5,
                'description' => 'Large resin art wall panel with ocean-inspired design. UV resistant.',
                'short_description' => 'Large resin art wall panel',
                'status' => 'published',
                'featured' => true,
                'is_new' => true,
                'is_trending' => true,
                'is_best_seller' => false,
                'tags' => ['New Arrival', 'Trending', 'Limited Edition'],
            ],
            [
                'name' => 'Embroidered Kurta Set',
                'slug' => 'embroidered-kurta-set',
                'category_slug' => 'kurtis',
                'brand' => 'Velisca Luxe',
                'price' => 4499,
                'sale_price' => 3799,
                'stock' => 15,
                'description' => 'Beautiful embroidered kurta set with matching dupatta. Festive wear.',
                'short_description' => 'Embroidered kurta set with dupatta',
                'status' => 'published',
                'featured' => false,
                'is_new' => false,
                'is_trending' => true,
                'is_best_seller' => false,
                'tags' => ['Trending'],
            ],
        ];

        foreach ($products as $data) {
            $category = Category::where('slug', $data['category_slug'])->first();
            $brand = Brand::where('name', $data['brand'])->first();
            $tagNames = $data['tags'];
            unset($data['category_slug'], $data['brand'], $data['tags']);

            $data['category_id'] = $category?->id;
            $data['brand_id'] = $brand?->id;
            $data['created_by'] = 1;
            $data['low_stock_threshold'] = 10;
            $data['published_at'] = now();

            $product = Product::firstOrCreate(
                ['slug' => $data['slug']],
                $data
            );

            $tags = Tag::whereIn('name', $tagNames)->pluck('id');
            $product->tags()->syncWithoutDetaching($tags);
        }

        // ========== Product Images (placeholder) ==========
        $productIds = Product::pluck('id');
        foreach ($productIds as $index => $pid) {
            if (ProductImage::where('product_id', $pid)->exists()) continue;
            ProductImage::create([
                'product_id' => $pid,
                'image' => "/images/products/product-{$pid}.jpg",
                'is_primary' => true,
                'sort_order' => 0,
            ]);
            ProductImage::create([
                'product_id' => $pid,
                'image' => "/images/products/product-{$pid}-2.jpg",
                'is_primary' => false,
                'sort_order' => 1,
            ]);
        }

        // ========== Product Variants ==========
        if (!ProductVariant::exists()) {
            $fashionProducts = Product::whereIn('category_id', Category::where('parent_id', $fashion->id)->pluck('id'))->get();
            $sizeIds = Size::where('category', 'clothing')->pluck('id');
            $colorIds = Color::whereIn('name', ['Pink', 'Beige', 'Black', 'White'])->pluck('id');

            $variantIndex = 1;
            foreach ($fashionProducts as $product) {
                foreach ($colorIds->take(2) as $colorId) {
                    foreach ($sizeIds->take(3) as $sizeId) {
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'sku' => "VRN-{$variantIndex}",
                            'color_id' => $colorId,
                            'size_id' => $sizeId,
                            'price' => $product->price + rand(-200, 500),
                            'sale_price' => $product->sale_price ? $product->sale_price + rand(-100, 300) : null,
                            'stock' => rand(0, 30),
                            'status' => true,
                        ]);
                        $variantIndex++;
                    }
                }
            }

            // Resin Art Variants (size only)
            $resinProducts = Product::where('category_id', $resinArt->id)->get();
            $homeSizes = Size::where('category', 'home')->pluck('id');
            foreach ($resinProducts as $product) {
                foreach ($homeSizes->take(2) as $sizeId) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => "VRN-{$variantIndex}",
                        'size_id' => $sizeId,
                        'price' => $product->price + rand(-300, 500),
                        'stock' => rand(2, 15),
                        'status' => true,
                    ]);
                    $variantIndex++;
                }
            }
        }

    }
}
