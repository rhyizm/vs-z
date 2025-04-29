import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AccountConnections from "@/components/settings/AccountConnections";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  console.log(user);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Enter your username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" disabled />
            {/* Email might be non-editable if managed by auth provider */}
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <AccountConnections />

      {/* Add more settings sections as needed */}
    </div>
  );
}
