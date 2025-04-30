import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server'; // Use getTranslations for Server Components
import { createClient } from "@/lib/supabase/server"; // Use server client
import AccountConnections from "@/components/settings/AccountConnections";
import { SettingsCard } from '@/components/settings/SettingsCard';

export default async function SettingsPage() {
  const t = await getTranslations('settings'); // Use await with getTranslations
  const supabase = await createClient(); // Await the client creation
  const { data: { user } } = await supabase.auth.getUser(); // Destructure user correctly

  if (!user) {
    redirect('/auth');
  }

  // Define profile fields using translations
  const profileFields = [
    { id: 'username', label: t('profile.usernameLabel'), type: 'text', placeholder: t('profile.usernamePlaceholder') },
    { id: 'email', label: t('profile.emailLabel'), type: 'email', placeholder: t('profile.emailPlaceholder') },
  ];

  // Server action remains the same
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
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <SettingsCard
        title={t('profile.title')}
        description={t('profile.description')}
        fields={profileFields}
        initialValues={{
          username: user?.user_metadata?.name || '',
          email: user?.email || '',
        }}
        onSubmit={handleProfileSubmit}
        submitButtonText={t('profile.saveButton')} // Pass translated button text
      />

      <AccountConnections
        title={t('accountConnections.title')}
        description={t('accountConnections.description')}
        googleConnectedText={t('accountConnections.googleConnected')}
        googleConnectText={t('accountConnections.googleConnect')}
      />
    </div>
  );
}
