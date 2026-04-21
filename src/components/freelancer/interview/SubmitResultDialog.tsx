'use client';

import React from 'react';
import {
  Loader2,
  Plus,
  Star,
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SubmitResultCard = {
  id: number;
  hiringDecision: string;
  rating: number;
  minting: boolean;
  minted: boolean;
};

type ParsedMintInput = {
  validationError: string | null;
};

interface SubmitResultDialogProps {
  open: boolean;
  onClose: () => void;
  submitCards: SubmitResultCard[];
  canAddNewCard: boolean;
  addNewCard: () => void;
  updateCard: (id: number, patch: Partial<SubmitResultCard>) => void;
  submitMint: (event: React.FormEvent, cardId: number) => Promise<void>;
  getParsedMintInput: (card: SubmitResultCard) => ParsedMintInput;
  hiringDecisionOptions: ReadonlyArray<{ value: string; label: string }>;
}

const getStarFillPercentage = (starIndex: number, rating: number) => {
  const diff = rating - (starIndex - 1);
  if (diff <= 0) return 0;
  if (diff >= 1) return 100;
  return Math.round(diff * 100);
};

export default function SubmitResultDialog({
  open,
  onClose,
  submitCards,
  canAddNewCard,
  addNewCard,
  updateCard,
  submitMint,
  getParsedMintInput,
  hiringDecisionOptions,
}: SubmitResultDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
    >
      <DialogContent className="w-[95vw] max-w-2xl overflow-hidden rounded-2xl border-none bg-background p-0 shadow-2xl sm:w-full">
        <div className="relative overflow-hidden bg-primary/5 px-6 py-8">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

          <DialogHeader className="relative space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Award className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Certify Interview Outcome
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-muted-foreground/80">
              Complete the evaluation below to mint the candidate&apos;s
              professional skill certificate (SBT).
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-primary/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Evaluation Cards
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addNewCard}
              disabled={!canAddNewCard}
              className="h-8 gap-2 rounded-full border-primary/20 bg-primary/5 px-3 text-xs font-medium text-primary hover:bg-primary/10"
              title={
                canAddNewCard
                  ? 'Add evaluation card'
                  : 'Complete current evaluations first'
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add Evaluation
            </Button>
          </div>

          <div className="space-y-6">
            {submitCards.map((card) => {
              const parsedMintInput = getParsedMintInput(card);
              const ratingLabel =
                card.rating > 0
                  ? `${card.rating.toFixed(1)} / 5.0`
                  : 'Awaiting Rating';

              return (
                <form
                  key={card.id}
                  className="relative space-y-6 rounded-2xl border border-border/50 bg-card/30 p-6 shadow-sm ring-1 ring-border/5 transition-all hover:bg-card/50"
                  onSubmit={(event) => {
                    void submitMint(event, card.id);
                  }}
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor={`hiringDecision-${card.id}`}
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Evaluation Verdict
                      </Label>
                      <Select
                        value={card.hiringDecision}
                        onValueChange={(value) =>
                          updateCard(card.id, { hiringDecision: value })
                        }
                      >
                        <SelectTrigger
                          id={`hiringDecision-${card.id}`}
                          className="h-12 rounded-xl border-border/60 bg-background/50 text-base focus:ring-primary/20"
                        >
                          <SelectValue placeholder="How did the candidate perform?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/60 shadow-xl">
                          {hiringDecisionOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="py-3 focus:bg-primary/5"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-sm font-semibold">
                          <Star className="h-4 w-4 text-primary" />
                          Technical Proficiency
                        </Label>
                        <span
                          className={`text-sm font-bold ${card.rating > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          {ratingLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-background/50 p-3 ring-1 ring-border/40">
                        <div
                          className="flex items-center gap-1.5"
                          role="radiogroup"
                          aria-label="Rating"
                        >
                          {[1, 2, 3, 4, 5].map((starIndex) => {
                            const fillPercentage = getStarFillPercentage(
                              starIndex,
                              card.rating,
                            );
                            return (
                              <div
                                key={starIndex}
                                className="relative h-10 w-10 transition-transform active:scale-90"
                              >
                                <button
                                  type="button"
                                  className="absolute left-0 top-0 z-20 h-full w-1/2 cursor-pointer focus:outline-none"
                                  onClick={() =>
                                    updateCard(card.id, {
                                      rating: starIndex - 0.5,
                                    })
                                  }
                                  aria-label={`Set rating to ${starIndex - 0.5} stars`}
                                />
                                <button
                                  type="button"
                                  className="absolute right-0 top-0 z-20 h-full w-1/2 cursor-pointer focus:outline-none"
                                  onClick={() =>
                                    updateCard(card.id, { rating: starIndex })
                                  }
                                  aria-label={`Set rating to ${starIndex} stars`}
                                />
                                <Star
                                  className={`h-10 w-10 ${fillPercentage > 0 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'}`}
                                />
                                {fillPercentage > 0 && fillPercentage < 100 && (
                                  <div
                                    className="pointer-events-none absolute inset-0 overflow-hidden"
                                    style={{ width: `${fillPercentage}%` }}
                                  >
                                    <Star className="h-10 w-10 fill-amber-400 text-amber-400" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground">
                          Half-stars enabled
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      {parsedMintInput.validationError ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          {parsedMintInput.validationError}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm font-medium text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          Evaluation ready for minting
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-xl px-6 font-medium"
                        >
                          Keep Drafting
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        disabled={
                          card.minting ||
                          Boolean(parsedMintInput.validationError)
                        }
                        className={`min-w-[160px] rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all ${
                          card.minted
                            ? 'bg-success text-success-foreground hover:bg-success'
                            : ''
                        }`}
                      >
                        {card.minting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Securing...
                          </>
                        ) : card.minted ? (
                          'Outcome Certified'
                        ) : (
                          'Mint Certificate'
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/40 bg-muted/30 px-6 py-4">
          <p className="text-center text-[11px] text-muted-foreground">
            Evaluation data is cryptographically signed. Once minted,
            certificates are permanent and viewable on public explorers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
