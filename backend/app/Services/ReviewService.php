<?php

namespace App\Services;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewService
{
    public function list(Request $request)
    {
        $query = Review::with(['user', 'product', 'images']);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($productId = $request->get('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($rating = $request->get('rating')) {
            $query->where('rating', $rating);
        }

        return $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));
    }

    public function getProductReviews($productId)
    {
        return Review::with(['user', 'images'])
            ->where('product_id', $productId)
            ->approved()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create(array $data): Review
    {
        return Review::create($data);
    }

    public function approve(Review $review): Review
    {
        $review->update(['status' => 'approved']);
        return $review;
    }

    public function reject(Review $review): Review
    {
        $review->update(['status' => 'rejected']);
        return $review;
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }
}
