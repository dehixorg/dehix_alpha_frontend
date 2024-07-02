"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  mobileNumber: z.string().nonempty("Mobile number is required"),
  emailAddress: z.string().email("Invalid email address"),
  username: z.string().nonempty("Username is required"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  github: z.string().nonempty("GitHub username is required"),
  instagram: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Home() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      emailAddress: "",
      username: "",
      password: "",
      github: "",
      instagram: "",
    },
  });

  const handleSubmit = (values: FormSchema) => {
    console.log({ values });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="max-w-md w-full flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">First Name</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="First name" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">Last Name</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Last name" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">Mobile Number</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Mobile number" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">Email Address</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">Username</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Username" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">Password</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="github"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">GitHub</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="GitHub username" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel className="w-1/3">Instagram (optional)</FormLabel>
                <FormControl className="w-2/3">
                  <Input placeholder="Instagram username" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-4">
            Done
          </Button>
        </form>
      </Form>
    </main>
  );
}
