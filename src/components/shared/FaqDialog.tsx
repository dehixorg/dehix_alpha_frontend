'use client';

import { HelpCircle, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import FAQAccordion from '@/components/accordian/faqAccordian';

interface FaqDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FaqDialog({ children, isOpen, onOpenChange }: FaqDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-0 flex flex-col h-[800px] rounded-2xl">
        <div className="flex flex-col h-full">
          <div className="p-6 pb-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                How can we help?
              </DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground">
                Find answers to common questions about our platform.
              </DialogDescription>
            </div>
          </div>

          <div className="border-t border-border/50 px-6 pt-4">
            <h3 className="font-medium text-muted-foreground text-sm mb-3">
              FREQUENTLY ASKED
            </h3>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto px-6 pb-4">
              <FAQAccordion />
            </div>
          </div>

          <DialogFooter className="bg-gradient-to-b from-background to-muted/5 px-6 py-5 border-t border-border/20">
            <div className="mx-auto w-full max-w-md">
              <div className="flex flex-col space-y-4 w-full">
                <div className="px-3">
                  <h3 className="font-medium text-muted-foreground text-base">
                    Need more help?
                  </h3>
                </div>

                <div className="space-y-3 px-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = 'mailto:support@dehix.com')
                    }
                    className="w-full h-16 px-6 rounded-xl border-2 border-border/30 hover:border-primary/60 hover:bg-accent/50 transition-all duration-200 hover:shadow-sm group"
                  >
                    <div className="flex items-center gap-4 w-full h-full">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">
                          Email Support
                        </div>
                        <div className="text-xs font-normal text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          We&lsquo;ll respond within 24 hours
                        </div>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
