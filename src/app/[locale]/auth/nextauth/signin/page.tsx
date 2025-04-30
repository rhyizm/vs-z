"use client"; // Required for using hooks like useTranslation and client-side event handlers

import { useState } from 'react';
import { signIn } from 'next-auth/react';
// Removed react-i18next import
import { useTranslations } from 'next-intl'; // Import next-intl hook
import { useParams } from 'next/navigation'; // To get locale for redirect

export default function NextAuthSignInPage() {
  const t = useTranslations(); // Use next-intl hook (loads all messages by default)
  const params = useParams();
  const locale = params.locale as string; // Keep locale for redirects/callbacks
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        redirect: false, // Handle redirect manually based on result
        email,
        password,
        // callbackUrl: `/${locale}` // Optional: specify where to redirect on success
      });

      if (result?.error) {
        console.error("Sign in failed:", result.error);
        // Map common errors to user-friendly messages using top-level errors
        if (result.error === "CredentialsSignin") {
          setError(t('errors.invalidCredentials'));
        } else {
          setError(t('errors.unknownError'));
        }
      } else if (result?.ok) {
        console.log("Sign in successful");
        // Redirect user to the home page for their locale
        window.location.href = `/${locale}`;
      }
    } catch (err) {
      console.error("Sign in exception:", err);
      setError(t('errors.unknownError')); // Use top-level error key
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('signIn.title')} {/* Keep page-specific title */}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('signIn.description')} {/* Keep page-specific description */}
          </p>
        </div>
        <form className="mt-8 space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800" onSubmit={handleSignIn}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t('authUI.sign_in.email_label')} {/* Use existing key */}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                placeholder={t('signIn.emailPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('authUI.sign_in.password_label')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                placeholder={t('signIn.passwordPlaceholder')}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {isLoading ? t('signIn.loading') : t('authUI.sign_in.button_label')}
            </button>
          </div>

          <div className="mt-6"> {/* Added margin-top for spacing */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: `/${locale}` })}
              className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
            >
              {/* Add Google Icon SVG or similar here if desired */}
              {t('signIn.googleButton')} {/* Add translation key */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
