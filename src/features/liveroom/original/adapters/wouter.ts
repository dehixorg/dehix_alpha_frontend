'use client';

import {
  useParams as useNextParams,
  usePathname,
  useRouter,
} from 'next/navigation';

function mapRoute(path: string, currentPath: string) {
  const isTalentRoute =
    currentPath.startsWith('/freelancer') || currentPath.startsWith('/talent');
  if (path === '/login' || path === '/register') return '/auth/login';
  if (path === '/business/dashboard') return '/business/liveroom';
  if (path === '/talent/dashboard') return '/freelancer/liveroom';
  if (path === '/talent/discovery') return '/business/market';
  if (path.startsWith('/talent/profile/')) {
    return path.replace('/talent/profile/', '/freelancer-profile/');
  }
  if (path === '/room/create') return '/business/liveroom/new';
  if (path === '/room/join') return '/freelancer/liveroom';
  if (path.startsWith('/room/')) {
    return path.replace(
      '/room/',
      isTalentRoute ? '/freelancer/liveroom/' : '/business/liveroom/',
    );
  }
  return path;
}

export function useLocation(): [string, (path: string) => void] {
  const pathname = usePathname();
  const router = useRouter();
  return [pathname, (path: string) => router.push(mapRoute(path, pathname))];
}

export function useParams<T extends Record<string, string>>() {
  const params = useNextParams() as Record<
    string,
    string | string[] | undefined
  >;
  const roomId = Array.isArray(params.room_id)
    ? params.room_id[0]
    : params.room_id;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return {
    ...params,
    id: id || roomId,
    room_id: roomId || id,
  } as unknown as T;
}
