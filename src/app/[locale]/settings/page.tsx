import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import AccountConnections from "@/components/settings/AccountConnections";
import { SettingsCard } from '@/components/settings/SettingsCard';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const profileFields = [
    { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter your username' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
  ];

  const handleProfileSubmit = async (values: Record<string, string>) => {
    'use server';
    console.log('Submitting profile data via Server Action:', values);

    try {
      const response = await fetch('/api/dummy/settings/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData.message);
        throw new Error(`Failed to update profile: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('API Success:', result.message);

    } catch (error) {
      console.error('Error submitting profile:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <SettingsCard
        title="Profile"
        description="Update your profile information."
        fields={profileFields}
        initialValues={{
          username: user?.user?.email || '',
          email: user?.user?.email || '',
        }}
        onSubmit={handleProfileSubmit}
      />

      <AccountConnections />
    </div>
  );
}
