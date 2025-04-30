'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateUserProfile } from '@/app/api/user';
import { User, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileFormProps {
  userData: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ProfileForm({ userData }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: userData.name,
      email: userData.email,
      currentPassword: '',
      password: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate password match if changing password
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Prepare data to update
    const updateData = {
      name: formData.name !== userData.name ? formData.name : undefined,
      email: formData.email !== userData.email ? formData.email : undefined,
      currentPassword: formData.currentPassword || undefined,
      password: formData.password || undefined,
    };

    // Only include fields that have changed
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    // If nothing has changed, just exit edit mode
    if (Object.keys(updateData).length === 0) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateUserProfile(updateData);

      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <User className="w-5 h-5 mr-2" />
          Profile Information
        </h2>
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={resetForm}
              className="flex items-center text-red-500"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-form"
              disabled={isLoading}
              className="flex items-center bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <form id="profile-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <>
              <div className="border-t pt-4 mt-4">
                <h3 className="text-md font-medium mb-3">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium mb-1"
                    >
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium mb-1"
                    >
                      New Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium mb-1"
                    >
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
