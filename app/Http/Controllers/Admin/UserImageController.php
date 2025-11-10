<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
     * 3. Imagen principal.
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

        if (!$filename) {
            return response()->json(['error' => 'Invalid file or upload failed'], 422);
        }

        $ui = new UserImage();
        $ui->image = $filename;
        $ui->user_id = $userId;
        $ui->featured = '0';
        $ui->public = 1;
        $ui->save();

        // Ensure model is fresh from DB (id populated)
        $ui->refresh();

        // Build a correct public URL (the file is stored under the `users/` folder on the public disk)
        $publicUrl = Storage::url('users/'.$filename);

        // Return an explicit payload so the client always receives id and url
        $payload = [
            'id' => $ui->id,
            'image' => $ui->image,
            'user_id' => $ui->user_id,
            'featured' => $ui->featured,
            'public' => $ui->public,
            'created_at' => $ui->created_at,
            'updated_at' => $ui->updated_at,
            'url' => $publicUrl,
        ];

        return response()->json($payload, 201);
    }

    /**
     * 2. Eliminar imagen.
     */
    public function destroy(Request $request, $image){
        // $image may be an id (numeric) or a filename. Try to resolve the UserImage model accordingly.
        $ui = null;
        if (is_numeric($image)) {
            $ui = UserImage::find($image);
        } else {
            // search by image filename
            $ui = UserImage::where('image', $image)->first();
        }

        if (!$ui) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['error' => __('imagen_no_encontrada')], 404);
            }
            return redirect()->back()->withErrors(['msg' => __('imagen_no_encontrada')]);
        }

        // Delete file from storage if present. Keep 'users' folder for backwards compatibility.
        if($ui->image && Storage::disk('public')->exists('users/'.$ui->image)){
            Storage::disk('public')->delete('users/'.$ui->image);
        }

        $ui->forceDelete();

        // If the request expects JSON (AJAX), return a JSON response so the client can handle it.
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => __('imagen_eliminada')], 200);
        }

        return redirect()->back()->with('msg', __('imagen_eliminada'));
    }

    /**
     * 3. Imagen principal.
     */
    public function setFeatured(Request $request){
        // $image may be provided as route param or via POST payload (id or filename)
        $imageParam = $image ?? $request->input('image') ?? $request->input('id');

        if (!$imageParam) {
            return response()->json(['error' => 'image parameter is required'], 400);
        }

        // Resolve by id or by filename
        if (is_numeric($imageParam)) {
            $ui = UserImage::find($imageParam);
        } else {
            $ui = UserImage::where('image', $imageParam)->first();
        }

        if (!$ui) {
            return response()->json(['error' => 'imagen no encontrada'], 404);
        }

        // Toggle featured: set all images for this user to featured = 0, then set this one to 1
        DB::transaction(function() use ($ui) {
            UserImage::where('user_id', $ui->user_id)->update(['featured' => 0]);
            $ui->featured = 1;
            $ui->save();
        });

        // Return updated list of the user's images so the client can sync state
        $images = UserImage::where('user_id', $ui->user_id)->get()->map(function($i){
            return array_merge($i->toArray(), ['url' => Storage::url('users/'.$i->image)]);
        });

        return response()->json(['image' => $ui->toArray(), 'images' => $images], 200);
    }
}
