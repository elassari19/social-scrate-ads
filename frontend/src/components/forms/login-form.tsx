'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { login } from '../../app/api/auth';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await login({ email, password });
      console.log('Login response:', response);

      if (response.error) {
        console.log('Login failed:', response);
        toast.error(response.error);
        setIsLoading(false);
        return;
      }

      // Store authentication status in localStorage for client-side state
      localStorage.setItem('isAuthenticated', 'true');

      // Store user data in localStorage for client components
      if (response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
      }

      toast.success('Login successful!');

      // Use router.push instead of redirect for client components
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      toast.error('Invalid email or password');
      console.error('Login error:', error);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-2">
        <div className="grid gap-1">
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
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
        <Button disabled={isLoading}>
          {isLoading && <span className="loading loading-spinner" />}
          Sign In
        </Button>
      </div>
    </form>
  );
}
