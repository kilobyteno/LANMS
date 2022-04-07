<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $r1 = Role::firstOrCreate(['name' => 'super-admin']);
        $r2 = Role::firstOrCreate(['name' => 'admin']);
        $r3 = Role::firstOrCreate(['name' => 'moderator']);

        $p1 = Permission::firstOrCreate(['name' => 'manage.users']);
        $p2 = Permission::firstOrCreate(['name' => 'manage.roles']);
        $p3 = Permission::firstOrCreate(['name' => 'manage.permissions']);

        // Super Admin permissions
        $r1->givePermissionTo(Permission::all());

        // Admin permissions
        $r2->givePermissionTo($p2->name);
        $r2->givePermissionTo($p3->name);

        // Moderator permissions
        // Nothing to do here

        $user = User::first();
        if ($user) {
            $user->assignRole($r1);
        }
    }
}
