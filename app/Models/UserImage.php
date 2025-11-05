<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class UserImage extends Model{
    /**
     * 1. Relación con user.
     * 2. Subir imagen.
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

    /**
     * 2. Subir imagen.
     */
    public static function saveUserImage($request){
        //dd($request->all());
        if(!$request->hasFile('file')) return null;    

        $file = $request->file('file');
        $mime = $file->getMimeType() ?: '';
        $size = $file->getSize() ?? 0;
        $slug = Str::slug($file->getClientOriginalName());

        $allowed = ['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml'];
        if(!in_array($mime, $allowed, true)) return null;
        if($size > 3 * 1024 * 1024) return null; // 3MB

        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $filename = $slug.'_'.time().'.'.$ext;

        // Usa el disk 'public' (config/filesystems.php)
        $file->storeAs('users', $filename, ['disk' => 'public']) ?: null;

        return $filename;
    }

    // Scopes útiles
    public function scopeForUser($q, int $userId){ return $q->where('user_id', $userId); }
    public function scopeFeatured($q){ return $q->where('featured', true); }
    public function scopePublic($q){ return $q->where('public', true); }
}
