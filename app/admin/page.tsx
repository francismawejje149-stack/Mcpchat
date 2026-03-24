import { hasAdmin, requireAdminSession } from "@/lib/auth";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SetupForm() {
  return (
    <form action="/api/admin/auth/setup" method="post" className="mx-auto mt-20 max-w-md space-y-3">
      <Card>
        <h1 className="mb-2 text-xl font-semibold">Create admin password</h1>
        <Input type="password" name="password" placeholder="Strong password" required minLength={8} />
        <Button className="mt-3 w-full" type="submit">Create Admin</Button>
      </Card>
    </form>
  );
}

function LoginForm() {
  return (
    <form action="/api/admin/auth/login" method="post" className="mx-auto mt-20 max-w-md space-y-3">
      <Card>
        <h1 className="mb-2 text-xl font-semibold">Admin Login</h1>
        <Input type="password" name="password" placeholder="Password" required />
        <Button className="mt-3 w-full" type="submit">Sign in</Button>
      </Card>
    </form>
  );
}

export default async function AdminPage() {
  const adminExists = await hasAdmin();
  if (!adminExists) return <SetupForm />;
  const authed = await requireAdminSession();
  if (!authed) return <LoginForm />;
  return <AdminConsole />;
}
