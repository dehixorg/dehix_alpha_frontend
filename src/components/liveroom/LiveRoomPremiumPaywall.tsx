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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface LiveRoomPremiumPaywallProps {
  onSuccess?: () => void;
  userId?: string;
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
  'Unlimited Live Room creation & scoping sessions',
  'Real-time Audio & Video interview room access',
  'AI-assisted project blueprint generation',
  'Automated contract & milestone builder',
  'Priority candidate invitations & notifications',
  'Cancel anytime • 30-day validity',
];

export default function LiveRoomPremiumPaywall({
  onSuccess,
  userId: _userId,
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
              'Your Live Room Monthly Plan (₹499/month) is now active!',
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 md:p-12 text-white shadow-2xl mb-12">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Business Premium Feature</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Dehix Live Room Workspace
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
            Access our real-time interactive workspace. Scope complex projects
            with AI assistance, conduct live audio/video interviews with top
            talent, and generate binding contracts automatically.
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
                  <Zap className="w-5 h-5 mr-2 fill-current" />
                  Activate Monthly Plan for ₹499
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <span className="text-xs text-slate-400 font-medium">
              ⚡ Instant setup • 30 Days Access • Secured by Razorpay
            </span>
          </div>
        </div>
      </div>

      {/* Grid Section: Features & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Feature Highlights (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Why upgrade to Live Room Pro?
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
              Most Popular
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
                  Subscribe Now — ₹499/mo
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
