'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '../ui/use-toast';

interface PhoneChangeModalProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    onSubmit: any;
    setPhone: any;
}

const PhoneChangeModal: React.FC<PhoneChangeModalProps> = ({ open, setOpen, onSubmit, setPhone }) => {
    const [newPhone, setNewPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPhone.length !== 10) {
            toast({
                variant: 'destructive',
                title: 'Invalid Phone Number',
                description: 'Please enter a valid 10-digit number.',
            });
            return;
        }

        try {
            setLoading(true);
            const formattedPhone = `+91${newPhone}`;
            setPhone(formattedPhone);
            await onSubmit(formattedPhone);
            toast({
                title: 'Sending OTP',
                description: `Sending OTP to ${formattedPhone}. Please wait...`,
            });
            setOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to Send OTP',
                description: 'Something went wrong. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Phone Number</DialogTitle>
                    <DialogDescription>
                        Enter a new phone number to receive the OTP.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div>
                        <Label className="mb-1 block">New Phone Number</Label>
                        <div className='mt-2'>
                            <Input
                                type="tel"
                                value={newPhone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 10) setNewPhone(value);
                                }}
                                maxLength={10}
                                placeholder="Enter 10-digit number"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send OTP'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PhoneChangeModal;
