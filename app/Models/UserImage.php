<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserImage extends Model{
    /**
     * 1. Relación con user.
     */

    use SoftDeletes;

    protected $table = 'user_images';

    protected $fillable = ['user_id','image','featured','public'];

    protected function casts(): array {
        return [
            'featured' => 'boolean',
            'public'   => 'boolean',
        ];
    }

    /**
     * 1. Relación con user.
     */
    public function user(){
        return $this->belongsTo(User::class);
    }

    // Scopes útiles
    public function scopeForUser($q, int $userId){ return $q->where('user_id', $userId); }
    public function scopeFeatured($q){ return $q->where('featured', true); }
    public function scopePublic($q){ return $q->where('public', true); }
}
