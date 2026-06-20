<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Models\AnnouncementBar;
use App\Models\CmsPage;
use App\Models\PopupCampaign;
use App\Traits\ApiResponseTrait;

class CmsController extends Controller
{
    use ApiResponseTrait;

    public function pages()
    {
        $pages = CmsPage::published()->orderBy('title')->get(['id', 'title', 'slug', 'page_type', 'excerpt', 'banner', 'published_at']);

        return $this->success('CMS pages retrieved', ['pages' => $pages]);
    }

    public function show($slug)
    {
        $page = CmsPage::where('slug', $slug)->published()->first();
        if (! $page) {
            return $this->notFound('Page not found');
        }

        return $this->success('CMS page retrieved', ['page' => $page]);
    }

    public function announcements()
    {
        $bars = AnnouncementBar::active()->get();

        return $this->success('Announcements retrieved', ['bars' => $bars]);
    }

    public function popups()
    {
        $popups = PopupCampaign::active()->get();

        return $this->success('Popups retrieved', ['popups' => $popups]);
    }
}
