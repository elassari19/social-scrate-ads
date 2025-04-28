import SignUpForm from '@/components/forms/signup-form';
import { Typography } from '@/components/ui/Typography';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/cookies';

export default async function SignupPage() {
  // Check if user is already authenticated
  const authenticated = await isAuthenticated();

  // If authenticated, redirect to home page
  if (authenticated) {
    redirect('/');
  }
  return (
    <div className="container relative flex-col items-center justify-center h-[calc(100vh-4rem)] grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-background" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Scrape Ads
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Typography
              variant="h1"
              className="text-2xl font-semibold tracking-tight"
            >
              Create an account
            </Typography>
            <Typography variant="p" className="text-sm text-muted-foreground">
              Enter your details to create your account
            </Typography>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
