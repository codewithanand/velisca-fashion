<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $query = User::query()->with('roles', 'permissions');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->get('role')) {
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        if ($status = $request->get('status')) {
            if ($status === 'active') {
                $query->where('role', '!=', 'blocked');
            } elseif ($status === 'blocked') {
                $query->where('role', 'blocked');
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return $this->success('Users retrieved', [
            'users' => UserResource::collection($users),
            'meta' => [
                'total' => $users->total(),
                'page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'avatar' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'customer',
            'avatar' => $validated['avatar'] ?? null,
        ]);

        if (! empty($validated['roles'])) {
            $user->assignRole($validated['roles']);
        }

        $user->load('roles', 'permissions');

        return $this->success('User created', ['user' => new UserResource($user)], 201);
    }

    public function show($id)
    {
        $user = User::with('roles', 'permissions')->find($id);

        if (! $user) {
            return $this->notFound('User not found');
        }

        return $this->success('User retrieved', [
            'user' => new UserResource($user),
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::with('roles', 'permissions')->find($id);

        if (! $user) {
            return $this->notFound('User not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|string',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'avatar' => 'nullable|string',
            'status' => 'nullable|string|in:active,blocked',
        ]);

        $updateData = [];

        if (isset($validated['name'])) {
            $updateData['name'] = $validated['name'];
        }
        if (isset($validated['email'])) {
            $updateData['email'] = $validated['email'];
        }
        if (array_key_exists('phone', $validated)) {
            $updateData['phone'] = $validated['phone'];
        }
        if (array_key_exists('avatar', $validated)) {
            $updateData['avatar'] = $validated['avatar'];
        }
        if (isset($validated['role'])) {
            $updateData['role'] = $validated['role'];
        }
        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if (isset($validated['status'])) {
            $updateData['role'] = $validated['status'] === 'blocked' ? 'blocked' : 'customer';
        }

        if (! empty($updateData)) {
            $user->update($updateData);
        }

        if ($request->has('roles')) {
            $user->syncRoles($validated['roles'] ?? []);
        }

        $user->load('roles', 'permissions');

        return $this->success('User updated', ['user' => new UserResource($user)]);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (! $user) {
            return $this->notFound('User not found');
        }

        if ($user->role === User::ROLE_ADMIN) {
            return $this->error('Cannot delete admin users');
        }

        $user->delete();

        return $this->success('User deleted');
    }

    public function toggleBlock($id)
    {
        $user = User::find($id);

        if (! $user) {
            return $this->notFound('User not found');
        }

        if ($user->role === User::ROLE_ADMIN || $user->role === User::ROLE_STAFF) {
            return $this->error('Cannot block admin or staff users');
        }

        if ($user->role === 'blocked') {
            $user->role = User::ROLE_CUSTOMER;
        } else {
            $user->role = 'blocked';
        }

        $user->save();

        return $this->success('User status updated', [
            'user' => new UserResource($user->load('roles', 'permissions')),
        ]);
    }

    public function assignRoles(Request $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return $this->notFound('User not found');
        }

        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user->syncRoles($validated['roles']);

        return $this->success('Roles assigned', [
            'user' => new UserResource($user->load('roles', 'permissions')),
        ]);
    }
}
