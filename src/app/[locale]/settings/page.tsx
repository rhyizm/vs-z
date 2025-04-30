import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import AccountConnections from "@/components/settings/AccountConnections";
import { SettingsCard } from '@/components/settings/SettingsCard'; // Added import

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Define fields for the profile settings card
  const profileFields = [
    { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter your username' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
  ];

  // Placeholder submit handler for profile settings
  const handleProfileSubmit = async (values: Record<string, string>) => {
    'use server';
    console.log('Submitting profile data via Server Action:', values);

    try {
      const response = await fetch('/api/dummy/settings/profile', { // Target the new API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values), // Send form values as JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData.message);
        // Optionally: Re-throw error or return an error state to the client component if needed
        throw new Error(`Failed to update profile: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('API Success:', result.message);
      // Optionally: Trigger revalidation or show success message if using a client component wrapper

    } catch (error) {
      console.error('Error submitting profile:', error);
      // Handle network errors or exceptions during fetch
      // Optionally: Return an error state
    }
  };


  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Profile Settings Card */}
      <SettingsCard
        title="Profile"
        description="Update your profile information."
        fields={profileFields}
        initialValues={{
          username: user?.user?.email || '', // Replace with actual initial username if available from user data
          email: user?.user?.email || '', // Use user email from auth
        }}
        onSubmit={handleProfileSubmit} // Pass the handler
      />

      <AccountConnections />

      {/* Add more settings sections as needed */}
    </div>
  );
}
