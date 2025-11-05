<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\User;
use App\Models\UserImage;

//Traits:
use App\Traits\HasUserPermissionsTrait;

class UserImageController extends Controller{
    /**
     * 1. Guardar imágenes.
     * 2. Eliminar imagen.
     */
    
    use HasUserPermissionsTrait;

    private $module = 'users';

    /**
     * 1. Guardar imágenes.
     */
    public function store(Request $request){
        if(!$request->entity_id){
            return response()->json(['error' => 'entity_id is required'], 400);
        }

        $userId = $request->entity_id;
        $filename = UserImage::saveUserImage($request);

        $ui = new UserImage();
        $ui->image = $filename;
        $ui->user_id = $userId;
        $ui->featured = '0';
        $ui->public = 1;
        $ui->save();

        // Append a public URL for convenience on the client
        $ui->url = Storage::url($filename);

        return response()->json($ui, 201);
    }

    /**
     * 2. Eliminar imagen.
     */
    public function destroy(UserImage $image){
        if($image->image && Storage::disk('public')->exists('users/'.$image->image)){
            Storage::disk('public')->delete('users/'.$image->image);
        }

        $image->delete();

        return redirect()->back()->with('msg', __('imagen_eliminada'));
    }
}
