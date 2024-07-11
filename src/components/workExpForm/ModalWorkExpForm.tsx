import React from 'react'
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const FormSchema = z.object({
    dob: z.date({
      required_error: 'A start date of working',
    }),
    start: z.date({
      required_error: 'A start date of working',
    }),
    end: z.date({
      required_error: 'A end date of working.',
    }),
  });
export default function ModalWorkExpForm() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });
  return (
    
    <div
        className="bg-black w-fit p-1rem rounded-lg flex flex-col items-center justify-center p-4 md:p-8"
        style={{ height: '100%' }}
    >
        <div className="flex flex-col items-center justify-center">
            <section className="flex flex-col items-center justify-center w-full p-6 mt-5 space-y-4 text-white rounded-lg shadow-lg md:ml-5">
                <Form {...form}>
                    <form action="#" className="space-y-6">
                        <div className="space-y-2">
                            <Label>Enter your job title</Label>
                            <Input
                                className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                                id="role"
                                name="role"
                                placeholder="Enter your job title"
                                required
                                type="text"
                            />
                            <FormDescription>Enter your job title</FormDescription>
                        </div>
    
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input
                                className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                                id="company-name"
                                name="companyName"
                                placeholder="Enter your organization's name"
                                required
                                type="text"
                            />
                            <FormDescription>Enter your organization's name</FormDescription>
                        </div>
    
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="start"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                    'w-[240px] pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground',
                                                    )}
                                                >
                                                    {field.value ? (
                                                    format(field.value, 'PPP')
                                                    ) : (
                                                    <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() ||
                                                    date < new Date('1900-01-01')
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>Your start date</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
        
                            <FormField
                                control={form.control}
                                name="end"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                    'w-[240px] pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground',
                                                    )}
                                                >
                                                    {field.value ? (
                                                    format(field.value, 'PPP')
                                                    ) : (
                                                    <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() ||
                                                    date < new Date('1900-01-01')
                                                }
                                            initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>Your end date</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Enter Reference Person Name</Label>
                            <Input
                                className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                                id="referneceName"
                                name="reference-name"
                                placeholder="Enter Reference Person Name"
                                type="text"
                            />
                            <FormDescription>Enter Reference Person Name</FormDescription>
                        </div>

                        <div className="space-y-2">
                            <Label>Enter Reference Person Email</Label>
                            <Input
                                className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                                id="referneceNameEmail"
                                name="reference-email"
                                placeholder="Enter Reference Person Email"
                                type="text"
                            />
                            <FormDescription>Enter Reference Person Email</FormDescription>
                        </div>
    
                        <div className="space-y-2">
                            <Label>Work Location</Label>
                            <Input
                                className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                                id="location"
                                name="location"
                                placeholder="Enter your work location"
                                type="text"
                            />
                            <FormDescription>Enter your work location</FormDescription>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <textarea
                                className="block w-full rounded-md border border-gray-300 bg-gray-950 py-2 px-3 text-gray-400 placeholder-gray-500 focus:border-[#00b8d4] focus:outline-none focus:ring-[#00b8d4]"
                                id="description"
                                name="description"
                                placeholder="Enter Description"
                                required
                                rows={4} // You can adjust the number of rows as needed
                            />
                            <FormDescription>Enter Description</FormDescription>
                        </div>
                    </form>
                </Form>
            </section>
        </div>
    </div>
  )
}