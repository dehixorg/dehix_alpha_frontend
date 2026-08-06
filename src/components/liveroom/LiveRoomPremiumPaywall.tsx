'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Zap,
  Sparkles,
  CheckCircle2,
  Video,
  FileCheck,
  MessageSquare,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Bot,
  AlertTriangle,
  CalendarX,
  RefreshCw,
  BarChart3,
  Clock,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export type SubscriptionBlockReason =
  | 'NOT_SUBSCRIBED'
  | 'LIMIT_REACHED'
  | 'EXPIRED';

interface LiveRoomPremiumPaywallProps {
  onSuccess?: () => void;
  userId?: string;
  /** Why the paywall is showing — drives which variant is rendered */
  reason?: SubscriptionBlockReason;
  /** Extra context passed from the parent (rooms used, expiry date, etc.) */
  subContext?: {
    roomsCreated?: number;
    roomsRemaining?: number;
    roomLimit?: number;
    expiresAt?: string | null;
  };
}

const PREMIUM_FEATURES = [
  {
    icon: Bot,
    color: 'from-blue-500 to-cyan-500',
    title: 'AI Blueprint & Requirements Engine',
    description:
      'Turn raw project ideas into structured architecture, tech stacks, and detailed milestone roadmaps in seconds.',
  },
  {
    icon: Video,
    color: 'from-purple-500 to-indigo-500',
    title: 'Live Audio & Video Interview Rooms',
    description:
      'Conduct real-time technical interviews and interactive scoping sessions directly inside dedicated room channels.',
  },
  {
    icon: FileCheck,
    color: 'from-emerald-500 to-teal-500',
    title: 'Automated Scope-to-Contract',
    description:
      'Seamlessly convert finalized live room blueprints into executable contracts and milestone agreements.',
  },
  {
    icon: MessageSquare,
    color: 'from-amber-500 to-orange-500',
    title: 'Multi-Channel Collaboration Spaces',
    description:
      'Organized workspace channels for General, AI Assistant, Technical Deep-Dive, and Direct Talent Communication.',
  },
  {
    icon: ShieldCheck,
    color: 'from-rose-500 to-pink-500',
    title: 'Direct Talent Matching & Access',
    description:
      'Invite pre-vetted top talent, review profiles, and match specialized developers for high-impact projects.',
  },
];

const PLAN_BENEFITS = [
  '2 Live Room projects per subscription cycle',
  'Real-time Audio & Video interview room access',
  'AI-assisted project blueprint generation',
  'Automated contract & milestone builder',
  'Priority candidate invitations & notifications',
  'Cancel anytime • 30-day validity',
];

// ─── Variant: Limit Reached Banner ────────────────────────────────────────────
function LimitReachedBanner({
  roomsCreated = 2,
  roomLimit = 2,
  expiresAt,
}: {
  roomsCreated?: number;
  roomLimit?: number;
  expiresAt?: string | null;
}) {
  const expiryDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const now = new Date();
  const expiry = expiresAt ? new Date(expiresAt) : null;
  const daysLeft = expiry
    ? Math.max(
        0,
        Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      )
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 p-6 md:p-8 mb-8 shadow-lg">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Icon */}
        <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <XCircle className="w-3.5 h-3.5" />
              Monthly Limit Reached
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-1">
            You&apos;ve used all {roomLimit} Live Room credits this month
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your current subscription included{' '}
            <strong className="text-foreground">
              {roomLimit} projects/chats
            </strong>{' '}
            for this cycle. You&apos;ve created{' '}
            <strong className="text-amber-600 dark:text-amber-400">
              {roomsCreated} of {roomLimit}
            </strong>
            .
            {expiryDate && daysLeft !== null && daysLeft > 0 && (
              <>
                {' '}
                Your plan expires in{' '}
                <strong className="text-foreground">
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                </strong>{' '}
                ({expiryDate}) but you have no remaining credits.
              </>
            )}
          </p>
          {/* Usage pills */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-1.5">
              {Array.from({ length: roomLimit }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-8 rounded-full transition-all ${
                    i < roomsCreated
                      ? 'bg-amber-500'
                      : 'bg-muted/50 border border-border/40'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {roomsCreated}/{roomLimit} credits used
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Variant: Expired Banner ───────────────────────────────────────────────────
function ExpiredBanner({ expiresAt }: { expiresAt?: string | null }) {
  const formattedDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 via-rose-500/5 to-red-500/10 p-6 md:p-8 mb-8 shadow-lg">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <CalendarX className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              Subscription Expired
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-1">
            Your Live Room subscription has ended
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {formattedDate ? (
              <>
                Your plan expired on{' '}
                <strong className="text-foreground">{formattedDate}</strong>
                .{' '}
              </>
            ) : (
              'Your plan is no longer active. '
            )}
            Renew now to start a fresh 30-day cycle with{' '}
            <strong className="text-foreground">2 new project credits</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LiveRoomPremiumPaywall({
  onSuccess,
  userId: _userId,
  reason = 'NOT_SUBSCRIBED',
  subContext,
}: LiveRoomPremiumPaywallProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setRazorpayLoaded(false);
      };
      document.body.appendChild(script);
    } else if (window?.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!razorpayLoaded && typeof window !== 'undefined' && !window.Razorpay) {
      notifyError(
        'Payment gateway is loading. Please refresh or try again in a moment.',
        'Razorpay Not Ready',
      );
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Razorpay Order
      const res = await axiosInstance.post(
        '/liveroom/subscription/create-order',
      );
      const { orderId, amount, currency, keyId } = res.data.data;

      // Step 2: Open Razorpay Popup
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount || 49900,
        currency: currency || 'INR',
        name: 'Dehix',
        description: 'Live Room Premium Monthly Plan (₹499/month)',
        image: '/favicon.ico',
        order_id: orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Step 3: Verify Payment on Backend
            await axiosInstance.post('/liveroom/subscription/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            notifySuccess(
              'Your Live Room Monthly Plan (₹499/month) is now active! You have 2 project credits for this cycle.',
              'Payment Successful 🎉',
            );

            if (onSuccess) {
              onSuccess();
            } else {
              window.location.reload();
            }
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            notifyError(
              verifyErr?.response?.data?.message ||
                'Payment received, but verification failed. Please contact support.',
              'Verification Error',
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        prefill: {
          name: 'Dehix Business User',
        },
        theme: {
          color: '#0f172a',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setLoading(false);
        notifyError(
          resp.error?.description || 'Payment was not completed.',
          'Payment Failed',
        );
      });
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      console.error('Failed to create Razorpay order:', err);
      notifyError(
        err?.response?.data?.message ||
          'Failed to initiate payment. Please try again.',
        'Order Creation Failed',
      );
    }
  };

  // ── Determine CTA label based on reason ────────────────────────────────────
  const ctaLabel =
    reason === 'NOT_SUBSCRIBED'
      ? 'Activate Monthly Plan for ₹499'
      : reason === 'LIMIT_REACHED'
        ? 'Buy New Subscription — ₹499'
        : 'Renew Subscription — ₹499';

  const ctaSubLabel =
    reason === 'NOT_SUBSCRIBED'
      ? '⚡ Instant setup • 30 Days Access • Secured by Razorpay'
      : reason === 'LIMIT_REACHED'
        ? '⚡ Resets your 2-project credit counter • Fresh 30-day cycle'
        : '⚡ New 30-day cycle starts immediately • 2 fresh project credits';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* ── Contextual warning banners (shown above hero only for blocked states) ── */}
      {reason === 'LIMIT_REACHED' && (
        <LimitReachedBanner
          roomsCreated={subContext?.roomsCreated ?? 2}
          roomLimit={subContext?.roomLimit ?? 2}
          expiresAt={subContext?.expiresAt}
        />
      )}
      {reason === 'EXPIRED' && (
        <ExpiredBanner expiresAt={subContext?.expiresAt} />
      )}

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 md:p-12 text-white shadow-2xl mb-12">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>
              {reason === 'NOT_SUBSCRIBED'
                ? 'Business Premium Feature'
                : reason === 'LIMIT_REACHED'
                  ? 'Monthly Credit Limit Reached'
                  : 'Subscription Renewal Required'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            {reason === 'NOT_SUBSCRIBED'
              ? 'Dehix Live Room Workspace'
              : reason === 'LIMIT_REACHED'
                ? 'Unlock 2 More Projects'
                : 'Renew to Keep Building'}
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
            {reason === 'NOT_SUBSCRIBED'
              ? 'Access our real-time interactive workspace. Scope complex projects with AI assistance, conduct live audio/video interviews with top talent, and generate binding contracts automatically.'
              : reason === 'LIMIT_REACHED'
                ? "You've used your 2 project credits for this subscription cycle. Purchase a new ₹499 subscription to get 2 fresh credits and start a new 30-day cycle right away."
                : 'Your Live Room subscription has expired. Renew for ₹499 to get a brand new 30-day cycle with 2 project credits and continue building with your team.'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {reason === 'NOT_SUBSCRIBED' ? (
                    <Zap className="w-5 h-5 mr-2 fill-current" />
                  ) : (
                    <RefreshCw className="w-5 h-5 mr-2" />
                  )}
                  {ctaLabel}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <span className="text-xs text-slate-400 font-medium">
              {ctaSubLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Grid Section: Features & Pricing ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Feature Highlights (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {reason === 'NOT_SUBSCRIBED'
              ? 'Why upgrade to Live Room Pro?'
              : 'What you get with each subscription'}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {PREMIUM_FEATURES.map((feature, idx) => {
              const IconComp = feature.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 md:p-5 rounded-2xl bg-card border border-border/60 hover:border-amber-500/40 transition-all hover:shadow-md group"
                >
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pricing Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-3xl bg-card border-2 border-amber-500/40 p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-md">
              {reason === 'NOT_SUBSCRIBED' ? 'Most Popular' : 'Renew Now'}
            </div>

            <div className="mb-6">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Business Monthly Plan
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                  ₹499
                </span>
                <span className="text-muted-foreground text-sm font-semibold">
                  / month
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Billed monthly via Razorpay. Full access for 30 days.
              </p>
            </div>

            {/* What's included in one cycle */}
            <div className="border border-amber-500/20 rounded-xl bg-amber-500/5 p-3.5 mb-5 flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">
                  What you get per cycle
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  30 days access • 2 Live Room project credits
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-6 mb-8 space-y-3">
              {PLAN_BENEFITS.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-foreground"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs md:text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 font-bold text-base py-6 rounded-xl shadow-lg shadow-amber-500/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing Order...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  {reason === 'NOT_SUBSCRIBED'
                    ? 'Subscribe Now — ₹499/mo'
                    : reason === 'LIMIT_REACHED'
                      ? 'Buy New Subscription — ₹499'
                      : 'Renew Now — ₹499'}
                </>
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                100% Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
