/* eslint-disable import/order, jsx-a11y/label-has-associated-control */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from '../adapters/wouter';
import { io } from '../adapters/socket';
import { liveRoomApiFetch as fetch } from '../api/runtime';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetTalentInvites,
  useGetTalentCredentials,
  useRespondInvite,
  useUpdateAvailability,
  getGetTalentInvitesQueryKey,
  getGetTalentCredentialsQueryKey,
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SBTCredentialCard } from '../components/SBTCredentialCard';
import { ReputationRing } from '../components/ReputationRing';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Search,
  Inbox,
  DoorOpen,
  Award,
  User,
  Check,
  Copy,
  ArrowUpRight,
  ShieldCheck,
  Key,
  CheckCircle2,
  Video,
  Edit2,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  scoping:
    'text-blue-500 bg-blue-500/10 border-blue-500/25 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20',
  matching:
    'text-amber-500 bg-amber-500/10 border-amber-500/25 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  open: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  assembling:
    'text-indigo-500 bg-indigo-500/10 border-indigo-500/25 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20',
  contracted:
    'text-emerald-500 bg-emerald-500/10 border-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  closed: 'text-muted-foreground bg-muted/20 border-border/55',
};

function UserAvatar({
  user,
  className = 'h-7 w-7 text-xs',
}: {
  user: any;
  className?: string;
}) {
  const avatarSrc =
    user?.avatarUrl ||
    user?.photoURL ||
    user?.profilePic ||
    user?.avatar ||
    user?.photo;
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'T';

  if (avatarSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarSrc}
        alt={user?.name || 'User'}
        className={`${className} rounded-lg object-cover border border-border/60 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center shrink-0 uppercase tracking-tighter`}
    >
      {initials}
    </div>
  );
}

export default function TalentDashboard() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const inviteQueryKey = useMemo(
    () => [...getGetTalentInvitesQueryKey(), user?._id ?? 'anonymous'],
    [user?._id],
  );
  const { data: invites, refetch: refetchInvites } = useGetTalentInvites({
    query: {
      enabled: isAuthenticated && user?.role === 'talent',
      queryKey: inviteQueryKey,
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
      refetchOnWindowFocus: true,
    },
  });
  const { data: credentials } = useGetTalentCredentials(user?._id ?? '', {
    query: {
      enabled: !!user?._id,
      queryKey: getGetTalentCredentialsQueryKey(user?._id ?? ''),
    },
  });
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [projectEnquiries, setProjectEnquiries] = useState<any[]>([]);
  const [hireOffers, setHireOffers] = useState<any[]>([]);
  const [copiedRoomCode, setCopiedRoomCode] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileWallet, setProfileWallet] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [respondingEnquiryId, setRespondingEnquiryId] = useState<string | null>(
    null,
  );
  const [respondingOfferId, setRespondingOfferId] = useState<string | null>(
    null,
  );
  const [roomSearch, setRoomSearch] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [inboxFilter, setInboxFilter] = useState<
    'all' | 'offer' | 'enquiry' | 'invite'
  >('all');

  const loadProjectEnquiries = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('dehix_token');
    try {
      const res = await fetch('/api/talent/enquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjectEnquiries(Array.isArray(data) ? data : []);
    } catch {
      setProjectEnquiries([]);
    }
  }, [isAuthenticated]);

  const loadHireOffers = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('dehix_token');
    try {
      const res = await fetch('/api/talent/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHireOffers(Array.isArray(data) ? data : []);
    } catch {
      setHireOffers([]);
    }
  }, [isAuthenticated]);

  const loadMyRooms = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('dehix_token');
    try {
      const res = await fetch('/api/talent/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const rooms = Array.isArray(data) ? data : [];
      setMyRooms(
        rooms.filter(
          (entry: any) =>
            !['invited', 'INVITED'].includes(
              String(entry.participant?.status || entry.status),
            ),
        ),
      );
    } catch {
      setMyRooms([]);
    }
  }, [isAuthenticated]);

  const refreshTalentInbox = useCallback(() => {
    void refetchInvites();
    void queryClient.invalidateQueries({
      queryKey: getGetTalentInvitesQueryKey(),
    });
    void loadMyRooms();
    void loadProjectEnquiries();
    void loadHireOffers();
  }, [
    loadHireOffers,
    loadMyRooms,
    loadProjectEnquiries,
    queryClient,
    refetchInvites,
  ]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'talent') return;
    refreshTalentInbox();
  }, [isAuthenticated, refreshTalentInbox, user?.role, user?._id]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'talent') return;

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshTalentInbox();
      }
    };

    window.addEventListener('focus', refreshTalentInbox);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refreshTalentInbox);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [isAuthenticated, refreshTalentInbox, user?.role, user?._id]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'talent') return;
    const token = localStorage.getItem('dehix_token');
    if (!token) return;

    const socketUrl = (
      process.env.NEXT_PUBLIC__BASE_URL || window.location.origin
    ).replace(/\/+$/, '');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', refreshTalentInbox);
    socket.on('talent:invited', () => {
      toast.success('New room invitation received');
      refreshTalentInbox();
    });
    socket.on('talent:project_enquiry', () => {
      toast.success('New project enquiry received');
      refreshTalentInbox();
    });
    socket.on('talent:hire_offer', () => {
      toast.success('New hire offer received');
      refreshTalentInbox();
    });
    socket.on('talent:hired', refreshTalentInbox);

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, refreshTalentInbox, user?.role, user?._id]);

  const updateAvailability = useUpdateAvailability({
    mutation: {
      onSuccess: () => {
        const nextState = !(user?.isOnline ?? false);
        toast.success(
          nextState ? 'You are now available for hire' : 'You are now offline',
        );
      },
      onError: () => toast.error('Failed to update availability'),
    },
  });

  const respondInvite = useRespondInvite({
    mutation: {
      onSuccess: (_, vars) => {
        refreshTalentInbox();
        const action = (vars.data as any)?.action;
        if (action === 'accept') toast.success('Joined room successfully!');
        else if (action === 'decline') toast.info('Invitation declined');
      },
      onError: () => toast.error('Failed to respond to invitation'),
    },
  });

  const inviteList = Array.isArray(invites) ? invites : [];

  // Build Unified Needs Action Priority Feed Items
  const priorityFeedItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'offer' | 'enquiry' | 'invite';
      title: string;
      role?: string;
      amountUsd?: number;
      matchScore?: number;
      status: string;
      summary?: string;
      skills?: string[];
      rawItem: any;
    }> = [];

    // Offers
    hireOffers.forEach((offer: any) => {
      if (['sent', 'changes_requested'].includes(offer.status)) {
        items.push({
          id: `offer-${offer._id}`,
          type: 'offer',
          title: offer.room?.title ?? 'Hire Offer',
          role: offer.role?.roleTitle ?? 'Project role',
          amountUsd: offer.amountUsd,
          status: offer.status,
          summary: offer.scopeSummary,
          rawItem: offer,
        });
      }
    });

    // Enquiries
    projectEnquiries.forEach((enquiry: any) => {
      if (enquiry.responseStatus === 'pending') {
        items.push({
          id: `enquiry-${enquiry._id}`,
          type: 'enquiry',
          title: enquiry.room?.title ?? 'Project Enquiry',
          role: enquiry.role?.roleTitle ?? enquiry.role?.skillDomain ?? 'Role',
          matchScore: enquiry.matchScore,
          status: enquiry.responseStatus,
          summary: enquiry.message,
          skills: enquiry.matchedSkills,
          rawItem: enquiry,
        });
      }
    });

    // Invitations
    inviteList.forEach((invite: any) => {
      items.push({
        id: `invite-${invite._id}`,
        type: 'invite',
        title: invite.room?.title ?? 'Room Invitation',
        role: invite.role?.roleTitle ?? invite.role?.skillDomain,
        status: invite.status || 'pending',
        summary: invite.room?.rawDescription || invite.project?.description,
        rawItem: invite,
      });
    });

    return items;
  }, [hireOffers, projectEnquiries, inviteList]);

  const filteredPriorityItems = useMemo(() => {
    if (inboxFilter === 'all') return priorityFeedItems;
    return priorityFeedItems.filter((item) => item.type === inboxFilter);
  }, [priorityFeedItems, inboxFilter]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in</p>
        </div>
      </div>
    );
  }

  const credList = Array.isArray(credentials) ? credentials : [];
  const pendingEnquiries = projectEnquiries.filter(
    (enquiry) => enquiry.responseStatus === 'pending',
  );
  const pendingOffers = hireOffers.filter((offer) =>
    ['sent', 'changes_requested'].includes(offer.status),
  );
  const totalPendingAsks =
    inviteList.length + pendingEnquiries.length + pendingOffers.length;

  const overallRep =
    credList.length > 0
      ? Math.round(
          credList.reduce(
            (s: number, c: any) => s + (c.reputationScore ?? 0),
            0,
          ) / credList.length,
        )
      : 0;

  const isOnline = user?.isOnline ?? false;

  const toggleOnline = () => {
    updateAvailability.mutate({ data: { isOnline: !isOnline } });
  };

  const saveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('dehix_token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName || undefined,
          walletAddress: profileWallet,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update profile');
      toast.success('Profile updated!');
      setEditingProfile(false);
      const stored = localStorage.getItem('dehix_user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('dehix_user', JSON.stringify({ ...u, ...data }));
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const respondProjectEnquiry = async (
    enquiryRecipientId: string,
    status: string,
  ) => {
    setRespondingEnquiryId(enquiryRecipientId);
    try {
      const token = localStorage.getItem('dehix_token');
      const res = await fetch(
        `/api/project-enquiries/${enquiryRecipientId}/respond`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error ?? 'Failed to respond to enquiry');
      toast.success('Enquiry response saved');
      loadProjectEnquiries();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to respond to enquiry');
    } finally {
      setRespondingEnquiryId(null);
    }
  };

  const respondHireOffer = async (
    offerId: string,
    status: 'accepted' | 'declined' | 'changes_requested',
  ) => {
    const message =
      status === 'changes_requested'
        ? window.prompt('What changes do you want to request?')?.trim()
        : undefined;
    if (status === 'changes_requested' && !message) return;
    setRespondingOfferId(offerId);
    try {
      const token = localStorage.getItem('dehix_token');
      const res = await fetch(`/api/talent/offers/${offerId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to respond to offer');
      toast.success(
        status === 'accepted'
          ? 'Offer accepted. Agreement is ready to sign.'
          : 'Offer response saved',
      );
      refreshTalentInbox();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to respond to offer');
    } finally {
      setRespondingOfferId(null);
    }
  };

  const filteredMyRooms = myRooms.filter((entry: any) => {
    if (!roomSearch.trim()) return true;
    const term = roomSearch.toLowerCase();
    const title = String(entry.room?.title || '').toLowerCase();
    const code = String(entry.room?.roomCode || '').toLowerCase();
    const role = String(entry.role?.roleTitle || '').toLowerCase();
    return title.includes(term) || code.includes(term) || role.includes(term);
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Summary Bar - Compact Action-First Header */}
      <div className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={user} className="h-7 w-7 text-xs" />
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-sm text-foreground truncate">
                {user?.name}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground border border-border/60 rounded-md px-1.5 py-0.5">
                Talent
              </span>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-xs font-mono pr-2 border-r border-border/40">
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-muted-foreground">Rep:</span>
                <span className="font-bold text-foreground">{overallRep}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DoorOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Rooms:</span>
                <span className="font-bold text-foreground">
                  {myRooms.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Inbox className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-muted-foreground">Needs Action:</span>
                <span className="font-bold text-rose-500">
                  {totalPendingAsks}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant={isOnline ? 'default' : 'outline'}
              onClick={toggleOnline}
              className={
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 gap-1.5 h-8 text-xs'
                  : 'gap-1.5 h-8 text-xs'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-white animate-pulse' : 'bg-muted-foreground'
                }`}
              />
              {isOnline ? 'Available' : 'Offline'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/room/join')}
              className="gap-1.5 h-8 text-xs"
            >
              <Key className="h-3.5 w-3.5" /> Join Code
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (Left: Priority Inbox & Active Work, Right: Profile & Readiness) */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Main Column (Needs Action Feed + Active LiveRooms + Credentials) */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {/* SECTION 1: Priority Inbox ("Needs Action") */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <Inbox className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                      Needs Action
                      {totalPendingAsks > 0 && (
                        <span className="text-xs font-mono font-bold bg-rose-500 text-white rounded-full px-2 py-0.5">
                          {totalPendingAsks}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Unified feed of pending invitations, project enquiries,
                      and hire offers
                    </p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setInboxFilter('all')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      inboxFilter === 'all'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All ({priorityFeedItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('offer')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      inboxFilter === 'offer'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Offers ({pendingOffers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('enquiry')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      inboxFilter === 'enquiry'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Enquiries ({pendingEnquiries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboxFilter('invite')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      inboxFilter === 'invite'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Invites ({inviteList.length})
                  </button>
                </div>
              </div>

              {/* Priority Feed Item Cards */}
              {filteredPriorityItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center space-y-2">
                  <Inbox className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm font-medium text-muted-foreground">
                    You are available for matching
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-md mx-auto">
                    Keep your profile and credentials updated to receive direct
                    LiveRoom invitations and hire offers.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPriorityItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-xs hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[9px] font-extrabold uppercase tracking-wider rounded-md px-2 py-0.5 border ${
                                item.type === 'offer'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : item.type === 'enquiry'
                                    ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                    : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {item.type === 'offer'
                                ? 'Hire Offer'
                                : item.type === 'enquiry'
                                  ? 'Project Enquiry'
                                  : 'Room Invite'}
                            </span>
                            <span className="text-xs font-semibold text-primary">
                              {item.role}
                            </span>
                            {item.amountUsd ? (
                              <span className="text-[10px] font-mono font-bold border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5">
                                ${item.amountUsd.toLocaleString()}
                              </span>
                            ) : null}
                            {item.matchScore !== undefined &&
                            item.matchScore !== null ? (
                              <span className="text-[10px] font-mono font-bold border border-primary/25 bg-primary/10 text-primary rounded-full px-2 py-0.5">
                                {item.matchScore}% match
                              </span>
                            ) : null}
                          </div>
                          <h3 className="font-bold text-sm text-foreground truncate">
                            {item.title}
                          </h3>
                        </div>

                        <span
                          className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 border capitalize shrink-0 ${
                            item.status === 'accepted' ||
                            item.status === 'contracted'
                              ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {String(item.status).replace(/_/g, ' ')}
                        </span>
                      </div>

                      {item.summary && (
                        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 italic line-clamp-2">
                          {item.summary}
                        </p>
                      )}

                      {item.skills && item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.skills.slice(0, 5).map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md px-2 py-0.5"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
                        {item.type === 'offer' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                respondHireOffer(item.rawItem._id, 'accepted')
                              }
                              disabled={respondingOfferId === item.rawItem._id}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-8 text-xs font-semibold"
                            >
                              Accept Offer <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                respondHireOffer(
                                  item.rawItem._id,
                                  'changes_requested',
                                )
                              }
                              disabled={respondingOfferId === item.rawItem._id}
                              className="h-8 text-xs"
                            >
                              Request Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                respondHireOffer(item.rawItem._id, 'declined')
                              }
                              disabled={respondingOfferId === item.rawItem._id}
                              className="text-rose-600 hover:bg-rose-500/10 h-8 text-xs"
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {item.type === 'enquiry' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                respondProjectEnquiry(
                                  item.rawItem._id,
                                  'interested',
                                )
                              }
                              disabled={
                                respondingEnquiryId === item.rawItem._id
                              }
                              className="gap-1.5 h-8 text-xs font-semibold"
                            >
                              Interested <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                respondProjectEnquiry(
                                  item.rawItem._id,
                                  'ask_question',
                                )
                              }
                              disabled={
                                respondingEnquiryId === item.rawItem._id
                              }
                              className="h-8 text-xs"
                            >
                              Ask Question
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                respondProjectEnquiry(
                                  item.rawItem._id,
                                  'not_interested',
                                )
                              }
                              disabled={
                                respondingEnquiryId === item.rawItem._id
                              }
                              className="text-rose-600 hover:bg-rose-500/10 h-8 text-xs"
                            >
                              Not Interested
                            </Button>
                          </>
                        )}

                        {item.type === 'invite' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                respondInvite.mutate({
                                  data: {
                                    participantId: item.rawItem._id,
                                    action: 'accept',
                                  },
                                });
                                if (item.rawItem.roomId)
                                  navigate(`/room/${item.rawItem.roomId}`);
                              }}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-8 text-xs font-semibold"
                            >
                              Join Room <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                respondInvite.mutate({
                                  data: {
                                    participantId: item.rawItem._id,
                                    action: 'decline',
                                  },
                                })
                              }
                              className="h-8 text-xs"
                            >
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 2: Active Work ("Active LiveRooms") */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <DoorOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                      Active LiveRooms
                      <span className="text-xs font-mono font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                        {myRooms.length}
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Live Room workspaces where you are an active team member
                    </p>
                  </div>
                </div>

                {/* Filter / Search input */}
                {myRooms.length > 0 && (
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      placeholder="Search active rooms..."
                      className="w-full bg-card border border-border/60 rounded-xl pl-8 pr-3 py-1 text-xs outline-none focus:border-primary/50"
                    />
                  </div>
                )}
              </div>

              {/* Room Cards List */}
              {filteredMyRooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center space-y-3">
                  <DoorOpen className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {roomSearch
                      ? 'No active rooms match your filter'
                      : 'No active rooms yet'}
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/room/join')}
                      className="gap-1.5 text-xs"
                    >
                      <Key className="h-3.5 w-3.5" /> Join with Code
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMyRooms.map((entry: any) => (
                    <div
                      key={entry.participantId}
                      className="rounded-xl border border-border/60 bg-card p-4 space-y-3 hover:border-primary/40 transition-all shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-primary">
                              {entry.role?.roleTitle ?? 'Team Member'}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground bg-muted/40 border border-border/40 rounded px-1.5 py-0.5">
                              {entry.room?.roomCode}
                            </span>
                            {entry.room?.meetLink && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                                <Video className="h-3 w-3" /> Meet Ready
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-foreground leading-snug truncate">
                            {entry.room?.title}
                          </h3>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${
                            STATUS_COLORS[entry.room?.status] ?? ''
                          }`}
                        >
                          {entry.room?.status}
                        </span>
                      </div>

                      {/* Milestone Progress */}
                      {entry.milestoneStats?.total > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border/20">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              Milestone Escrow
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              $
                              {(
                                entry.milestoneStats.releasedUsd ?? 0
                              ).toLocaleString()}{' '}
                              / $
                              {(
                                entry.milestoneStats.totalUsd ?? 0
                              ).toLocaleString()}{' '}
                              Released
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  entry.milestoneStats.totalUsd > 0
                                    ? Math.round(
                                        (entry.milestoneStats.releasedUsd /
                                          entry.milestoneStats.totalUsd) *
                                          100,
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/30">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(entry.room?.roomCode)
                              .then(() => {
                                setCopiedRoomCode(entry.room?.roomCode);
                                setTimeout(() => setCopiedRoomCode(null), 2000);
                              });
                          }}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedRoomCode === entry.room?.roomCode ? (
                            <span className="text-emerald-600 font-bold">
                              ✓ Code Copied
                            </span>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Code
                            </>
                          )}
                        </button>

                        <Button
                          size="sm"
                          onClick={() => navigate(`/room/${entry.room?._id}`)}
                          className="gap-1.5 font-bold h-8 text-xs"
                        >
                          Enter Room <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 3: SBT Credentials (Positioned Lower Down) */}
            <section className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                      SBT Credentials
                      <span className="text-xs font-mono font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                        {credList.length}
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Verified soulbound badges issued upon technical assessment
                    </p>
                  </div>
                </div>
              </div>

              {credList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center space-y-2">
                  <Award className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No credentials issued yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-md mx-auto">
                    Verified credentials are automatically minted after
                    technical interviews and GitHub code analysis.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {credList.map((cred: any) => (
                    <SBTCredentialCard key={cred._id} credential={cred} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar Column (Profile & Readiness, Quick Actions) */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Profile Readiness & Availability Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Profile & Readiness
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />{' '}
                  {editingProfile ? 'Close' : 'Edit'}
                </button>
              </div>

              {/* Inline Profile Editor */}
              {editingProfile && (
                <div className="space-y-3 bg-muted/30 border border-border/40 p-3 rounded-xl">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                      Display Name
                    </label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder={user?.name ?? 'Your name'}
                      className="w-full bg-background border border-border/50 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                      Wallet Address
                    </label>
                    <input
                      value={profileWallet}
                      onChange={(e) => setProfileWallet(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-background border border-border/50 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-primary/60"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="w-full text-xs h-7 font-bold"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              )}

              {/* Reputation & Readiness Checklist */}
              <div className="flex items-center gap-4 bg-muted/20 border border-border/30 rounded-xl p-3">
                <ReputationRing score={overallRep} size={50} />
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Overall Reputation
                  </div>
                  <div className="font-bold font-mono text-foreground text-xl">
                    {overallRep}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {credList.length} verified badge
                    {credList.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Readiness Checklist */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Readiness Checklist
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                    <span className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          isOnline
                            ? 'text-emerald-500'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                      Available for Matching
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isOnline ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}
                    >
                      {isOnline ? 'Active' : 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                    <span className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          credList.length > 0
                            ? 'text-emerald-500'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                      Verified Credentials
                    </span>
                    <span className="text-[10px] font-bold font-mono">
                      {credList.length} Badges
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                    <span className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          user?.name
                            ? 'text-emerald-500'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                      Talent Profile
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/talent/profile/${user?._id}`)}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      View →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action: Join Room by Code */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Key className="h-4 w-4 text-primary" /> Join LiveRoom with Code
              </div>
              <p className="text-xs text-muted-foreground">
                Received a code from a business client? Enter it below to
                directly join their LiveRoom workspace.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Enter code (e.g. DHX-8821)"
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary/60"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (joinCodeInput.trim()) {
                      navigate(
                        `/room/join?code=${encodeURIComponent(joinCodeInput.trim())}`,
                      );
                    } else {
                      navigate('/room/join');
                    }
                  }}
                  className="w-full gap-1.5 font-bold text-xs h-8"
                >
                  Join Workspace <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
