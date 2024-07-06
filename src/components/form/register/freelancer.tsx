"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/shared/datePicker";
import { LoaderCircle, Rocket } from "lucide-react";

export default function FreelancerRegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" placeholder="Max" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" placeholder="Robinson" required />
          </div>
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="123-456-7890" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="yourusername" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            type="url"
            placeholder="https://github.com/yourusername"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/yourprofile"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="personalWebsite">Personal Website</Label>
          <Input
            id="personalWebsite"
            type="url"
            placeholder="https://www.yourwebsite.com"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="perHourPrice">Hourly Rate ($)</Label>
          <Input id="perHourPrice" type="number" placeholder="0" required />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="resume">Resume (URL)</Label>
          <Input
            id="resume"
            type="url"
            placeholder="https://www.yourresume.com"
            required
          />
        </div>
        <div className="grid gap-2 mt-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="grid gap-2">
            <Label htmlFor="DOB">DOB</Label>
            <DatePicker />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workExperience">Work Experience (Years)</Label>
            <Input id="workExperience" type="number" placeholder="0" required min="0" />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="mr-2 h-4 w-4" />
          )}{" "}
          Create an account
        </Button>
      </div>
    </form>
  );
}
