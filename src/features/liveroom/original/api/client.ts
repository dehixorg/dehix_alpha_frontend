'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { liveRoomJson, transformRoom } from './runtime';

type HookOptions = {
  query?: Record<string, any>;
  mutation?: {
    onSuccess?: (data: any, vars: any) => void;
    onError?: (error: any) => void;
  };
};

export const getGetMyRoomsQueryKey = () => ['liveroom', 'business', 'rooms'];
export const getGetTalentInvitesQueryKey = () => [
  'liveroom',
  'talent',
  'invites',
];
export const getGetTalentCredentialsQueryKey = (id = '') => [
  'liveroom',
  'talent',
  'credentials',
  id,
];

export function useGetMyRooms(options: HookOptions = {}) {
  return useQuery({
    queryKey: options.query?.queryKey || getGetMyRoomsQueryKey(),
    queryFn: () => liveRoomJson<any[]>('/rooms/my'),
    enabled: options.query?.enabled ?? true,
  });
}

export function useGetTalentInvites(options: HookOptions = {}) {
  return useQuery({
    queryKey: options.query?.queryKey || getGetTalentInvitesQueryKey(),
    queryFn: async () => {
      const entries = await liveRoomJson<any[]>('/talent/rooms');
      return entries
        .filter((entry) =>
          ['invited', 'INVITED'].includes(
            String(entry.participant?.status || entry.status),
          ),
        )
        .map((entry) => ({
          _id: entry.participant?._id || entry._id,
          roomId: entry.participant?.roomId || entry.room?._id || entry.roomId,
          room: transformRoom(entry.room || entry),
          roleTitle: entry.role?.roleTitle || entry.participant?.roleTitle,
          status: String(
            entry.participant?.status || entry.status || 'invited',
          ).toLowerCase(),
        }));
    },
    enabled: options.query?.enabled ?? true,
  });
}

export function useGetTalentCredentials(_id = '', options: HookOptions = {}) {
  return useQuery({
    queryKey: options.query?.queryKey || getGetTalentCredentialsQueryKey(_id),
    queryFn: async () => [],
    enabled: options.query?.enabled ?? true,
  });
}

export function useRespondInvite(options: HookOptions = {}) {
  return useMutation({
    mutationFn: ({
      inviteId,
      data,
    }: {
      inviteId?: string;
      data: { participantId?: string; action: string };
    }) =>
      liveRoomJson(
        `/talent/invites/${inviteId || data.participantId}/respond`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        },
      ),
    onSuccess: options.mutation?.onSuccess,
    onError: options.mutation?.onError,
  });
}

export function useUpdateAvailability(options: HookOptions = {}) {
  return useMutation({
    mutationFn: async ({ data }: { data: { isOnline: boolean } }) => data,
    onSuccess: options.mutation?.onSuccess,
    onError: options.mutation?.onError,
  });
}
