<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'product_id',
    'rating',
    'comment',
    'verified_purchase',
    'helpful_count',
    'not_helpful_count',
    'is_spam',
    'admin_reply',
])]
class Review extends Model
{
    protected function casts(): array
    {
        return [
            'is_spam' => 'boolean',
            'verified_purchase' => 'boolean',
            'helpful_count' => 'integer',
            'not_helpful_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ReviewMedia::class)->orderBy('sort_order');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ReviewVote::class);
    }

    public function helpfulVotes()
    {
        return $this->hasMany(ReviewVote::class)->where('is_helpful', true);
    }

    public function notHelpfulVotes()
    {
        return $this->hasMany(ReviewVote::class)->where('is_helpful', false);
    }
}
