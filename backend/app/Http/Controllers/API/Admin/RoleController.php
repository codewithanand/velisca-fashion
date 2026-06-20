<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $roles = Role::with('permissions')
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        $roles->getCollection()->transform(function ($role) {
            $role->users_count = $role->users()->count();

            return $role;
        });

        return $this->success('Roles retrieved', [
            'roles' => $roles,
            'meta' => [
                'total' => $roles->total(),
                'page' => $roles->currentPage(),
                'per_page' => $roles->perPage(),
                'last_page' => $roles->lastPage(),
            ],
        ]);
    }

    public function all()
    {
        $roles = Role::with('permissions')->orderBy('name')->get();

        return $this->success('All roles retrieved', ['roles' => $roles]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        $role->load('permissions');

        return $this->success('Role created', ['role' => $role], 201);
    }

    public function show($id)
    {
        $role = Role::with('permissions')->find($id);

        if (! $role) {
            return $this->notFound('Role not found');
        }

        $role->users_count = $role->users()->count();

        return $this->success('Role retrieved', ['role' => $role]);
    }

    public function update(Request $request, $id)
    {
        $role = Role::find($id);

        if (! $role) {
            return $this->notFound('Role not found');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$id,
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);

        if ($request->has('permissions')) {
            $role->syncPermissions($validated['permissions'] ?? []);
        }

        $role->load('permissions');

        return $this->success('Role updated', ['role' => $role]);
    }

    public function destroy($id)
    {
        $role = Role::find($id);

        if (! $role) {
            return $this->notFound('Role not found');
        }

        if ($role->name === 'Super Admin') {
            return $this->error('Cannot delete Super Admin role');
        }

        $role->delete();

        return $this->success('Role deleted');
    }
}
