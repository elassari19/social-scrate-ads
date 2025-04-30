import { getUserProfile } from '@/app/api/user';
import ProfileForm from '@/components/forms/profile-form';
import SubscriptionInfo from '@/components/forms/subscription-info';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Your Profile | Tonfy',
  description: 'Manage your Tonfy profile and subscription settings',
};

export default async function ProfilePage() {
  // Get user profile data
  const { data: userData, success } = await getUserProfile();

  // If not authenticated, redirect to login
  if (!success || !userData) {
    redirect('/login?redirect=/profile');
  }

  // Format subscription data for the component
  const subscription = userData.subscription
    ? {
        plan: userData.subscription.plan,
        status: userData.subscription.status,
        requestLimit: userData.subscription.requestLimit,
        requestCount: userData.subscription.requestCount,
        endDate: userData.subscription.endDate,
      }
    : null;

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your account information and subscription settings
        </p>

        <div className="space-y-8">
          {/* Profile Information Section */}
          <ProfileForm userData={userData} />

          {/* Subscription Information Section */}
          <SubscriptionInfo subscription={subscription} />

          {/* Account Activity Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Account Activity</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {userData.metrics && (
                <>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">Total Scraping Jobs</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userData.metrics.totalScrapingJobs}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">Total Ad Reports</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userData.metrics.totalAdReports}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Last Activity</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userData.metrics.lastActivityDate
                          ? new Date(
                              userData.metrics.lastActivityDate
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
