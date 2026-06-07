<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\ReviewService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ReviewService $reviewService
    ) {}

    public function index(Request $request)
    {
        $reviews = $this->reviewService->list($request);

        return $this->success('Reviews retrieved', [
            'reviews' => ReviewResource::collection($reviews),
            'meta' => [
                'total' => $reviews->total(),
                'page' => $reviews->currentPage(),
                'per_page' => $reviews->perPage(),
                'last_page' => $reviews->lastPage(),
            ],
        ]);
    }

    public function approve($id)
    {
        try {
            $review = Review::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Review not found');
        }

        $review = $this->reviewService->approve($review);

        return $this->success('Review approved', [
            'review' => new ReviewResource($review),
        ]);
    }

    public function reject($id)
    {
        try {
            $review = Review::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Review not found');
        }

        $review = $this->reviewService->reject($review);

        return $this->success('Review rejected', [
            'review' => new ReviewResource($review),
        ]);
    }

    public function destroy($id)
    {
        try {
            $review = Review::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFound('Review not found');
        }

        $this->reviewService->delete($review);

        return $this->success('Review deleted');
    }
}
