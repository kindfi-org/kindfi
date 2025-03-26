import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/base/dialog";
import { Button } from "~/components/base/button";
import { BadgeAlert, Fingerprint, Key, Lock, Shield } from "lucide-react";
import { Card } from "../base/card";

export function PasskeyInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="gradient-border-btn w-full"
        >
          <BadgeAlert className="mr-2" />
          What is a passkey?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between">
            <div>
              <DialogTitle className="gradient-text font-extrabold text-3xl">
                What are Passkeys?
              </DialogTitle>
              <DialogDescription className="mt-1 text-lg">
                The modern, passwordless way to sign in
              </DialogDescription>
            </div>
            <div className="flex justify-center items-center rounded-full bg-primary/10 my-2 px-4">
              <Key className="text-primary text-3xl" />
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <section>
            <Card className="w-full max-w-md text-lg p-4">
              <p className="">
                Passkeys are replacements for passwords that provide strong
                security and better user experience.
              </p>
            </Card>
          </section>
          <section className="flex items-start">
            <div className="flex justify-center items-center rounded-full bg-primary/10 p-4">
              <Shield className="text-primary text-3xl" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold mb-2">More Secure</h2>
              <h3>
                Passkeys uses strong cryptography and biometric(like your finger
                print or face) to protect your acoount from phishing and data
                breaches.
              </h3>
            </div>
          </section>
          <section className="flex items-start">
            <div className="flex justify-center items-center rounded-full bg-blue-500/10 p-4">
              <Fingerprint className="text-blue-500 text-3xl" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold mb-2">Easier to Use</h2>
              <h3>
                No more remembering complex passwords. Just use your device's
                biometric authentication or pin to sign in instantly.
              </h3>
            </div>
          </section>
          <section className="flex items-start">
            <div className="flex justify-center items-center rounded-full bg-purple-500/10 p-4">
              <Lock className="text-purple-500 text-3xl" />
            </div>
            <div className="ml-4">
              <h2 className="font-semibold mb-2">Works Across Devices</h2>
              <h3>
                Your passkey sync securely across your devices, so you can sign
                in from anywhere.
              </h3>
            </div>
          </section>
          <section>
            <Card className="w-full max-w-md text-lg p-4">
              <h3 className="font-medium mb-2">How it works</h3>
              <p className="text-sm text-muted-foreground">
                <ul>
                  <li>1. Enter your username</li>
                  <li className="flex items-start gap-1">
                    <span>2.</span>
                    <span className="inline">
                      Your device will prompt you to authenticate with your
                      fingerprint, face, or pin
                    </span>
                  </li>
                  <li>3. Your are secure signed in - no password needed</li>
                </ul>
              </p>
            </Card>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
