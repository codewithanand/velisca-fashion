<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $permissions = Permission::orderBy('name')
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->get();

        return $this->success('Permissions retrieved', ['permissions' => $permissions]);
    }

    public function grouped()
    {
        $permissions = Permission::orderBy('name')->get();

        $groups = $permissions->groupBy(function ($permission) {
            $parts = explode(' ', $permission->name);
            return count($parts) > 1 ? ucfirst($parts[1]) : 'General';
        });

        return $this->success('Permissions grouped', ['groups' => $groups]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
            'guard_name' => 'nullable|string|default:web',
        ]);

        $permission = Permission::create([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name'] ?? 'web',
        ]);

        return $this->success('Permission created', ['permission' => $permission], 201);
    }

    public function destroy($id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return $this->notFound('Permission not found');
        }

        $permission->delete();

        return $this->success('Permission deleted');
    }

    public function assignToRole(Request $request, $roleId)
    {
        $role = Role::find($roleId);

        if (!$role) {
            return $this->notFound('Role not found');
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions']);

        return $this->success('Permissions assigned to role', [
            'role' => $role->load('permissions'),
        ]);
    }

    public function assignToUser(Request $request, $userId)
    {
        $user = \App\Models\User::find($userId);

        if (!$user) {
            return $this->notFound('User not found');
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $user->syncPermissions($validated['permissions']);

        return $this->success('Permissions assigned to user', [
            'user' => $user->load('permissions', 'roles'),
        ]);
    }
}
