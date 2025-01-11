import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { forgotPasswordAction } from "~/app/actions";
import { Button } from "~/components/base/button";
import { Input } from "~/components/base/input";
import { Label } from "~/components/base/label";
import { FormMessage, type Message } from "~/components/form-message";
import { AuthForm } from "~/components/layout/auth/auth-form";
import { AuthLayout } from "~/components/layout/auth/auth-layout";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <AuthLayout>
      <AuthForm
        title="Forgot Your Password?"
        subtitle="Enter your email address and we’ll send you a link to reset it."
        footerContent={
          <div>
            Remembered your password?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-medium hover:underline"
            >
              Go back to login
            </Link>
          </div>
        }
      >
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <Button className="w-full" formAction={forgotPasswordAction}>
            Send Recovery Link
          </Button>

          {searchParams && <FormMessage message={searchParams} />}
        </form>
      </AuthForm>
    </AuthLayout>
  );
}

// Optional: Add success state component
interface SuccessMessageProps {
  email: string;
}

const SuccessMessage = ({ email }: SuccessMessageProps) => (
  <div className="space-y-4">
    <div className="flex flex-col items-center justify-center space-y-2">
      <CheckCircle className="w-12 h-12 text-green-500" />
      <h2 className="text-2xl font-semibold">Check Your Email!</h2>
    </div>
    <p className="text-center text-muted-foreground">
      We’ve sent a recovery link to <strong>{email}</strong>. The link will expire in 24 hours.
    </p>
    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        Didn’t receive the email?{" "}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </p>
    </div>
  </div>
);