import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <div className="mt-1 text-gray-900 dark:text-gray-100">{user.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="mt-1 text-gray-900 dark:text-gray-100">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <div className="mt-1 text-gray-900 dark:text-gray-100 capitalize">{user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}