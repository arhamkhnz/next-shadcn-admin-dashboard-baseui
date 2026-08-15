import { LockKeyhole } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <LockKeyhole aria-hidden="true" />
          </span>
          <CardTitle className="text-xl">LiftNGo Admin</CardTitle>
          <CardDescription>Sign in to manage LiftNGo operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
