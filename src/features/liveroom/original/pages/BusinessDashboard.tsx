/* eslint-disable import/order, jsx-a11y/label-has-associated-control, @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useLocation } from '../adapters/wouter';
import { useGetMyRooms, getGetMyRoomsQueryKey } from '../api/client';
import { liveRoomApiFetch as fetch } from '../api/runtime';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  Search,
  Layers,
  Users,
  FileCheck,
  Archive,
  Coins,
  Clipboard,
  Ticket,
  Calendar,
  Play,
  CheckCircle2,
  ClipboardCopy,
  ArrowUpRight,
  Trash2,
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

export default function BusinessDashboard() {
  const [, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { data: rooms, isLoading } = useGetMyRooms({
    query: { enabled: isAuthenticated, queryKey: getGetMyRoomsQueryKey() },
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [roomSearch, setRoomSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<
    'all' | 'active' | 'contracted' | 'closed'
  >('all');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileWallet, setProfileWallet] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [publishingProjectId, setPublishingProjectId] = useState<string | null>(
    null,
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in</p>
          <Button onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </div>
    );
  }

  const roomList = Array.isArray(rooms) ? rooms : [];
  const activeRooms = roomList.filter(
    (r: any) => !['closed'].includes(r.status),
  );
  const pastRooms = roomList.filter((r: any) => r.status === 'closed');

  const copyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(
      () => toast.success(`Room code ${code} copied!`),
      () => toast.error('Failed to copy code'),
    );
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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

  const deleteRoom = async (event: React.MouseEvent, room: any) => {
    event.stopPropagation();
    if (deletingRoomId) return;
    const confirmation = window.prompt(
      `This permanently deletes "${room.title}" and all room data. Type DELETE to continue.`,
    );
    if (confirmation?.trim().toUpperCase() !== 'DELETE') return;

    setDeletingRoomId(room._id);
    try {
      const token = localStorage.getItem('dehix_token');
      if (!token) throw new Error('Please sign in again');
      const res = await fetch(`/api/rooms/${room._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.error
            ? `${data.error} (${res.status})`
            : `Failed to delete room (${res.status})`,
        );
      queryClient.setQueryData(getGetMyRoomsQueryKey(), (current: any) =>
        Array.isArray(current)
          ? current.filter((item: any) => item._id !== room._id)
          : current,
      );
      await queryClient.invalidateQueries({
        queryKey: getGetMyRoomsQueryKey(),
      });
      toast.success('Room deleted');
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to delete room');
    } finally {
      setDeletingRoomId(null);
    }
  };

  const publishProject = async (event: React.MouseEvent, room: any) => {
    event.stopPropagation();
    const projectId = room.projectId || room.project?._id;
    if (!projectId || publishingProjectId) return;
    setPublishingProjectId(projectId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/marketplace/publish`,
        { method: 'PUT' },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to publish');
      }
      queryClient.setQueryData(getGetMyRoomsQueryKey(), (current: any) =>
        Array.isArray(current)
          ? current.map((item: any) =>
              (item.projectId || item.project?._id) === projectId
                ? {
                    ...item,
                    marketplaceStatus: 'live',
                    project: {
                      ...(item.project || {}),
                      ...(data.project || {}),
                      marketplaceStatus: 'live',
                    },
                  }
                : item,
            )
          : current,
      );
      await queryClient.invalidateQueries({
        queryKey: getGetMyRoomsQueryKey(),
      });
      toast.success(
        data.alreadyPublished
          ? 'Project is already live'
          : 'Project published to marketplace',
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to publish project');
    } finally {
      setPublishingProjectId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-primary font-bold text-[10px]">DX</span>
            </div>
            <span className="font-medium text-sm">{user?.name}</span>
            <span className="text-xs text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">
              Business
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/talent/discovery')}
            >
              Find Talent
            </Button>
            <Button size="sm" onClick={() => navigate('/room/create')}>
              New Live Room
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setProfileName(user?.name ?? '');
                setProfileWallet((user as any)?.walletAddress ?? '');
                setEditingProfile(true);
              }}
            >
              Edit Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your live rooms and assembled squads
          </p>
        </div>

        {/* Profile Edit Panel */}
        {editingProfile && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Edit Profile</span>
              <button
                onClick={() => setEditingProfile(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ Cancel
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Display Name
                </label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder={user?.name ?? 'Your name'}
                  className="w-full bg-card border border-border/50 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Wallet Address
                </label>
                <input
                  value={profileWallet}
                  onChange={(e) => setProfileWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-card border border-border/50 rounded-md px-3 py-2 text-sm font-mono outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <Button size="sm" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* Stats row */}
        {!isLoading && roomList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              {
                label: 'Total Rooms',
                value: roomList.length,
                mono: false,
                icon: <Layers className="h-4 w-4 text-primary" />,
              },
              {
                label: 'Participants',
                value: roomList.reduce(
                  (s: number, r: any) => s + (r.participantCount ?? 0),
                  0,
                ),
                mono: false,
                icon: <Users className="h-4 w-4 text-blue-400" />,
              },
              {
                label: 'Contracted',
                value: roomList.filter((r: any) => r.status === 'contracted')
                  .length,
                mono: false,
                icon: <FileCheck className="h-4 w-4 text-emerald-400" />,
              },
              {
                label: 'Closed',
                value: pastRooms.length,
                mono: false,
                icon: <Archive className="h-4 w-4 text-muted-foreground" />,
              },
              {
                label: 'Total Escrow',
                value: `$${roomList.reduce((s: number, r: any) => s + (r.milestoneStats?.totalUsd ?? 0), 0).toLocaleString()}`,
                sub: `$${roomList.reduce((s: number, r: any) => s + (r.milestoneStats?.releasedUsd ?? 0), 0).toLocaleString()} released`,
                mono: true,
                icon: <Coins className="h-4 w-4 text-emerald-500" />,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-card/85 to-card/35 p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_2px_12px_rgba(var(--primary-rgb),0.02)] group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {s.label}
                  </span>
                  <div className="p-1 rounded-lg bg-background/40 border border-border/20 shrink-0">
                    {s.icon}
                  </div>
                </div>
                <div
                  className={`text-2xl font-black tracking-tight ${s.mono ? 'font-mono text-green-500' : 'text-foreground'}`}
                >
                  {s.value}
                </div>
                {(s as any).sub && (
                  <div className="text-[9px] text-muted-foreground/60 font-mono mt-1 border-t border-border/10 pt-1">
                    {(s as any).sub}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-background/40 p-1 border border-border/40 rounded-lg backdrop-blur-sm">
              {(['all', 'active', 'contracted', 'closed'] as const).map((f) => {
                const count =
                  f === 'all'
                    ? roomList.length
                    : f === 'active'
                      ? activeRooms.length
                      : f === 'closed'
                        ? pastRooms.length
                        : roomList.filter((r: any) => r.status === 'contracted')
                            .length;
                const isActive = roomFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setRoomFilter(f)}
                    className={`text-xs px-3.5 py-1.5 rounded-md capitalize transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {f}{' '}
                    <span
                      className={`ml-1 text-[10px] font-bold ${isActive ? 'text-primary-foreground/90' : 'text-muted-foreground/60'}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/45" />
              <input
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder="Search rooms..."
                className="bg-card/70 border border-border/50 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-primary/50 w-48 placeholder:text-muted-foreground/45 transition-all focus:w-56"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-card/50 border border-border/40 animate-pulse animate-duration-1000"
                />
              ))}
            </div>
          ) : roomList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 p-12 text-center bg-card/20 backdrop-blur-sm">
              <Layers className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-medium mb-4">
                No active rooms
              </p>
              <Button size="sm" onClick={() => navigate('/room/create')}>
                Open your first room
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {roomList
                .filter((r: any) => {
                  if (roomFilter === 'active')
                    return !['closed', 'contracted'].includes(r.status);
                  if (roomFilter === 'contracted')
                    return r.status === 'contracted';
                  if (roomFilter === 'closed') return r.status === 'closed';
                  return true;
                })
                .filter(
                  (r: any) =>
                    !roomSearch ||
                    r.title.toLowerCase().includes(roomSearch.toLowerCase()),
                )
                .map((room: any) => (
                  <div
                    key={room._id}
                    className="rounded-xl border border-border/50 bg-gradient-to-br from-card/85 to-background/35 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(var(--primary-rgb),0.025)] group overflow-hidden"
                  >
                    <button
                      onClick={() => navigate(`/room/${room._id}`)}
                      className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize tracking-wider ${STATUS_COLORS[room.status] ?? ''}`}
                          >
                            {room.status}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/60 border border-border/30 bg-muted/10 rounded px-1.5 py-0.5">
                            {room.roomCode}
                          </span>
                          {(room.projectId || room.project?._id) && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize tracking-wider ${
                                room.marketplaceStatus === 'live' ||
                                room.project?.marketplaceStatus === 'live'
                                  ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25 dark:text-emerald-400'
                                  : 'text-zinc-500 bg-zinc-500/10 border-zinc-500/25 dark:text-zinc-300'
                              }`}
                            >
                              {room.marketplaceStatus === 'live' ||
                              room.project?.marketplaceStatus === 'live'
                                ? 'market live'
                                : 'hidden draft'}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {room.title}
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                          </h3>
                          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                            {room.rawDescription}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <div className="text-xs text-muted-foreground/60 font-medium flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(room.createdAt).toLocaleDateString()}
                        </div>
                        {room.contractedAt && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
                            Contracted{' '}
                            {new Date(room.contractedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </button>
                    <div className="px-5 py-3.5 bg-background/30 flex items-center justify-between gap-3 border-t border-border/30 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={(e) => copyCode(e, room.roomCode)}
                          className="text-[11px] font-medium text-muted-foreground/75 hover:text-foreground transition-colors flex items-center gap-1.5 bg-background/55 hover:bg-background border border-border/30 px-2.5 py-1 rounded-md"
                        >
                          {copiedCode === room.roomCode ? (
                            <span className="text-green-500 flex items-center gap-1">
                              ✓ Copied
                            </span>
                          ) : (
                            <>
                              <ClipboardCopy className="h-3.5 w-3.5" /> Copy
                              invite code
                            </>
                          )}
                        </button>
                        {room.participantCount > 0 && (
                          <span className="text-[11px] text-muted-foreground/80 font-medium flex items-center gap-1 bg-background/35 px-2 py-1 rounded border border-border/10">
                            <Users className="h-3.5 w-3.5 text-blue-400" />{' '}
                            {room.participantCount} joined
                          </span>
                        )}
                        {room.ticketStats?.total > 0 && (
                          <span className="text-[11px] text-muted-foreground/80 font-medium flex items-center gap-1 bg-background/35 px-2 py-1 rounded border border-border/10">
                            <Ticket className="h-3.5 w-3.5 text-amber-400" />{' '}
                            {room.ticketStats.done}/{room.ticketStats.total}{' '}
                            tickets
                          </span>
                        )}
                        {room.milestoneStats?.total > 0 && (
                          <div className="flex items-center gap-2 bg-background/35 px-2.5 py-1 rounded border border-border/10">
                            <div className="w-16 h-1.5 bg-muted/70 rounded-full overflow-hidden shrink-0">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Math.round((room.milestoneStats.releasedUsd / (room.milestoneStats.totalUsd || 1)) * 100))}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-muted-foreground/90 font-bold font-mono">
                              $
                              {room.milestoneStats.releasedUsd?.toLocaleString() ??
                                0}
                              /$
                              {room.milestoneStats.totalUsd?.toLocaleString() ??
                                0}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(room.projectId || room.project?._id) &&
                          room.marketplaceStatus !== 'live' &&
                          room.project?.marketplaceStatus !== 'live' && (
                            <button
                              onClick={(e) => void publishProject(e, room)}
                              disabled={
                                publishingProjectId ===
                                (room.projectId || room.project?._id)
                              }
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 rounded px-2.5 py-1 font-bold transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              {publishingProjectId ===
                              (room.projectId || room.project?._id)
                                ? 'Publishing'
                                : 'Publish'}
                            </button>
                          )}
                        <button
                          onClick={() => navigate(`/talent/discovery`)}
                          className="text-[11px] font-semibold text-primary hover:underline transition-colors flex items-center gap-0.5"
                        >
                          Find talent →
                        </button>
                        {room.status === 'assembling' && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (
                                !confirm(
                                  'Mark this room as contracted? This indicates all parties have agreed.',
                                )
                              )
                                return;
                              try {
                                const token =
                                  localStorage.getItem('dehix_token');
                                const res = await fetch(
                                  `/api/rooms/${room._id}/contract`,
                                  {
                                    method: 'POST',
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                if (!res.ok) throw new Error('Failed');
                                await queryClient.invalidateQueries({
                                  queryKey: getGetMyRoomsQueryKey(),
                                });
                                toast.success('Room contracted!');
                              } catch {
                                toast.error('Failed to contract room');
                              }
                            }}
                            className="text-[11px] text-blue-500 dark:text-blue-400 border border-blue-500/25 hover:border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/15 rounded px-2.5 py-1 font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <Play className="h-3 w-3 fill-current" /> Contract
                          </button>
                        )}
                        <button
                          onClick={(e) => void deleteRoom(e, room)}
                          disabled={deletingRoomId === room._id}
                          className="text-[11px] text-red-500 dark:text-red-400 border border-red-500/25 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 rounded px-2.5 py-1 font-bold transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          {deletingRoomId === room._id ? 'Deleting' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
