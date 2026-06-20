<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\HomepageLayout;
use App\Models\HomeSection;
use App\Traits\ApiResponseTrait;

class PublicHomepageController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $layout = HomepageLayout::with(['sections' => function ($q) {
            $q->where('status', true)->with('items')->orderBy('sort_order');
        }])->where('is_active', true)->first();

        if (! $layout) {
            $sections = HomeSection::where('status', true)->with('items')->orderBy('sort_order')->get();
        } else {
            $sections = $layout->sections;
        }

        $banners = Banner::active()->homepage()->orderBy('priority', 'desc')->orderBy('sort_order')->get();

        return $this->success('Homepage data retrieved', [
            'sections' => $sections,
            'banners' => $banners,
            'layout' => $layout,
        ]);
    }

    public function sections()
    {
        $sections = HomeSection::where('status', true)
            ->with('items')
            ->orderBy('sort_order')
            ->get();

        return $this->success('Homepage sections retrieved', ['sections' => $sections]);
    }

    public function banners()
    {
        $banners = Banner::active()->homepage()->orderBy('priority', 'desc')->orderBy('sort_order')->get();

        return $this->success('Banners retrieved', ['banners' => $banners]);
    }
}
