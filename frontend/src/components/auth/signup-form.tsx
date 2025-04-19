'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { signup } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated using localStorage
  const isAuthenticated =
    typeof window !== 'undefined' &&
    localStorage.getItem('isAuthenticated') === 'true';

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    redirect('/');
    return null;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await signup({ name, email, password });

      if (response && response.success) {
        toast.success('Account created successfully! You can now log in.');
        // Redirect to login page after successful signup
        redirect('/login');
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            type="text"
            name="name"
            autoCapitalize="none"
            autoComplete="name"
            autoCorrect="off"
            disabled={isLoading}
          />
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            name="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
          />
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>
        <Button disabled={isLoading}>
          {isLoading && <span className="loading loading-spinner" />}
          Sign Up
        </Button>
      </div>
    </form>
  );
}
