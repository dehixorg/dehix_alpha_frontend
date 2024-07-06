"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/themeToggle";
import FreelancerRegisterForm from "@/components/form/register/freelancer";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  return (
    <>
      <div className="absolute left-10 top-10">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up as a Freelancer</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <FreelancerRegisterForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Button variant="outline" size="sm" className="ml-2" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Button variant="link" className="p-0" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>{" "}
            and{" "}
            <Button variant="link" className="p-0" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            .
          </p>
        </div>
      </div>
    </>
  );
}
