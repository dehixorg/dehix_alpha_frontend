'use client';

const API_BASE = (
  process.env.NEXT_PUBLIC__BASE_URL || 'http://localhost:8080'
).replace(/\/+$/, '');
let nativeFetch: typeof fetch | null = null;
let fetchBridgeRefCount = 0;
let restoreNativeFetch: typeof fetch | null = null;

type FetchInput = string | URL | Request;

function authHeaders() {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('dehix_token')
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function parseJson(init?: RequestInit) {
  if (!init?.body || typeof init.body !== 'string') return {};
  try {
    return JSON.parse(init.body);
  } catch {
    return {};
  }
}

async function backend(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  Object.entries(authHeaders()).forEach(([key, value]) =>
    headers.set(key, value),
  );
  return (nativeFetch || fetch)(`${API_BASE}${path}`, { ...init, headers });
}

async function backendJson(path: string, init: RequestInit = {}) {
  const res = await backend(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed (${res.status})`,
    );
  }
  return data?.data ?? data;
}

function lower(value?: unknown) {
  return String(value || '').toLowerCase();
}

function transformSession(session: any) {
  if (!session) return session;
  return {
    ...session,
    rawIdea: session.rawIdea || session.idea,
  };
}

export function transformRoom(room: any) {
  if (!room) return room;
  return {
    ...room,
    status: lower(room.status),
    ticketStats: room.ticketStats || { total: 0, done: 0 },
    milestoneStats: room.milestoneStats || { totalUsd: 0, releasedUsd: 0 },
    participantCount: room.participantCount || 0,
    roleCount: room.roleCount || room.roles?.length || 0,
  };
}

function transformChannel(channel: any) {
  return {
    ...channel,
    type: lower(channel.type),
    interviewStatus: channel.interviewStatus
      ? lower(channel.interviewStatus)
      : channel.interviewStatus,
    interviewMeetLink: channel.meetingLink || channel.interviewMeetLink || null,
  };
}

function transformMessage(message: any) {
  return {
    ...message,
    id: message.id || message._id,
    type: lower(message.type),
    createdAt: message.createdAt || new Date().toISOString(),
    isAi: lower(message.type) === 'ai',
  };
}

function transformParticipant(participant: any) {
  const person = participant.user || null;
  return {
    ...participant,
    talentId: participant.freelancerId || participant.talentId,
    userId: person
      ? {
          _id: person._id,
          name: person.name || person.userName || 'Talent',
          email: person.email,
          avatarUrl: person.profilePic || person.avatarUrl || null,
        }
      : participant.freelancerId,
    user: person
      ? {
          _id: person._id,
          name: person.name || person.userName || 'Talent',
          email: person.email,
          avatarUrl: person.profilePic || person.avatarUrl || null,
        }
      : null,
    status: lower(participant.status),
  };
}

function buildOptionalTechnicalQuestions(session: any) {
  const text =
    `${session?.idea || ''} ${JSON.stringify(session?.analysis || {})}`.toLowerCase();
  const questions = [
    {
      _id: 'optional_success_metric',
      question:
        'Which success metric should the first LiveRoom team optimize for after launch?',
      required: false,
    },
    {
      _id: 'optional_existing_assets',
      question:
        'Do you already have any designs, datasets, APIs, documents, brand assets, or code that the team should reuse?',
      required: false,
    },
    {
      _id: 'optional_user_roles',
      question:
        'Which user roles or permission levels should exist in the first version?',
      required: false,
    },
    {
      _id: 'optional_integrations',
      question:
        'Which third-party tools should be connected first, and which can wait until after MVP?',
      required: false,
    },
    {
      _id: 'optional_handoff_expectation',
      question:
        'What should the final handoff include: source code, deployment, admin training, analytics, documentation, or support?',
      required: false,
    },
  ];

  if (
    text.includes('ai') ||
    text.includes('automation') ||
    text.includes('chatbot')
  ) {
    questions.unshift({
      _id: 'optional_ai_boundaries',
      question:
        'What should the AI be allowed to decide automatically, and where should a human approve the output?',
      required: false,
    });
  }

  if (
    text.includes('payment') ||
    text.includes('subscription') ||
    text.includes('marketplace')
  ) {
    questions.push({
      _id: 'optional_payment_flow',
      question:
        'What payment, subscription, escrow, refund, or invoice flow should be included in the first release?',
      required: false,
    });
  }

  return questions.slice(0, 6);
}

function transformWorkspace(payload: any) {
  const workspace = payload?.data ?? payload;
  const participants = (workspace.participants || []).map(transformParticipant);
  const documents = (workspace.documents || []).map((doc: any) => ({
    source: 'standard',
    ...doc,
    canView: doc.canView !== false,
  }));
  return {
    ...workspace,
    room: transformRoom(workspace.room),
    channels: (workspace.channels || []).map(transformChannel),
    messages: (workspace.messages || []).map(transformMessage),
    participants,
    tickets: workspace.tickets || [],
    milestones: workspace.milestones || [],
    nda: workspace.nda || null,
    offers: workspace.offers || [],
    documents,
    permissionMatrix:
      workspace.permissionMatrix ||
      participants.map((participant: any) => ({
        participantId: participant._id,
        talentId: participant.talentId,
        name: participant.user?.name || 'Talent',
        email: participant.user?.email,
        roleTitle: workspace.roles?.find(
          (role: any) => role._id === participant.roleId,
        )?.roleTitle,
        status: participant.status,
        documents: documents.map((doc: any) => ({
          docType: doc.docType,
          title: doc.title,
          canView: doc.canView !== false,
        })),
      })),
    currentUserAccess: workspace.currentUserAccess ||
      workspace.access || {
        isOwner: false,
        canManageDocuments: false,
        canSeeAllChannels: false,
      },
  };
}

function selectedTalentFromRecommendations(items: any[] = []) {
  return items.map((item) => ({
    freelancerId: item.talentId || item.user?._id,
    profileId: item.profileId,
    roleTitle: item.matchedRole?.roleTitle,
  }));
}

export async function liveRoomApiFetch(
  input: FetchInput,
  init: RequestInit = {},
) {
  const rawUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  if (!rawUrl.startsWith('/api/')) {
    return (nativeFetch || fetch)(input, init);
  }

  const url = new URL(rawUrl, window.location.origin);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = (init.method || 'GET').toUpperCase();

  try {
    if (path === '/auth/me') {
      const raw =
        localStorage.getItem('dehix_user') || localStorage.getItem('user');
      return jsonResponse(raw ? JSON.parse(raw) : null);
    }

    if (path === '/auth/profile') {
      const body = await parseJson(init);
      const raw =
        localStorage.getItem('dehix_user') || localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : {};
      const next = {
        ...user,
        name: body.name || user.name,
        walletAddress: body.walletAddress,
      };
      localStorage.setItem('dehix_user', JSON.stringify(next));
      return jsonResponse(next);
    }

    if (path === '/ai/chat-history') {
      return jsonResponse({ messages: [] });
    }

    if (path === '/ai/chat' && method === 'POST') {
      const body = await parseJson(init);
      if (!body.launchSessionId) {
        return jsonResponse({
          reply:
            'Create the LiveRoom analysis first so DEHIX AI can use the saved context.',
        });
      }
      const data = await backendJson(
        `/liveroom/launch/${body.launchSessionId}/ai`,
        {
          method: 'POST',
          body: JSON.stringify({
            message: body.message,
            clientContext: body.clientContext,
          }),
        },
      );
      const message = {
        id: `ai-${Date.now()}`,
        userName: 'DEHIX AI',
        message: data.message,
        isAi: true,
        createdAt: new Date(),
      };
      return jsonResponse({ reply: data.message, message });
    }

    if (path === '/launch' && method === 'POST') {
      const body = await parseJson(init);
      const session = await backendJson('/liveroom/launch', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const analyzed = await backendJson(
        `/liveroom/launch/${session._id}/phase/ANALYSIS`,
        {
          method: 'PUT',
          body: JSON.stringify({}),
        },
      );
      return jsonResponse({
        session: transformSession(analyzed),
        analysis: analyzed.analysis,
        phase1Status: 'ready',
      });
    }

    const launchStatus = path.match(/^\/launch\/([^/]+)\/status$/);
    if (launchStatus) {
      const session = await backendJson(`/liveroom/launch/${launchStatus[1]}`);
      return jsonResponse({
        session: transformSession(session),
        analysis: session.analysis,
        blueprint: session.blueprint,
        phase1Status: session.analysis ? 'ready' : 'generating',
        phase2Status: session.blueprint ? 'ready' : 'generating',
      });
    }

    const phase1 = path.match(/^\/launch\/([^/]+)\/phase1-confirmation$/);
    if (phase1 && method === 'PUT') {
      const body = await parseJson(init);
      const session = await backendJson(
        `/liveroom/launch/${phase1[1]}/phase/ANALYSIS`,
        {
          method: 'PUT',
          body: JSON.stringify({ phase1Review: body }),
        },
      );
      return jsonResponse({
        session: transformSession(session),
        analysis: session.analysis,
      });
    }

    const questions = path.match(/^\/launch\/([^/]+)\/technical-questions$/);
    if (questions) {
      const session = await backendJson(`/liveroom/launch/${questions[1]}`);
      return jsonResponse({
        mandatoryQuestions: [
          {
            _id: 'primary_user_goal',
            question:
              'Who will use this product first, and what is the main thing they should be able to do on day one?',
            required: true,
          },
          {
            _id: 'first_platform',
            question:
              'Where should the first version launch: web app, mobile app, admin dashboard, API, or something else?',
            required: true,
          },
          {
            _id: 'must_have_features',
            question:
              'What are the top 3 must-have features for the first usable version?',
            required: true,
          },
          {
            _id: 'accounts_payments_data',
            question:
              'Will the product need user accounts, payments, file uploads, chat, maps, AI, blockchain, or third-party integrations?',
            required: true,
          },
          {
            _id: 'constraints',
            question:
              'Do you have any fixed timeline, budget range, compliance needs, or existing tools/data that the team must work with?',
            required: true,
          },
        ],
        optionalQuestions: buildOptionalTechnicalQuestions(session),
      });
    }

    const blueprint = path.match(/^\/launch\/([^/]+)\/blueprint$/);
    if (blueprint && method === 'POST') {
      const body = await parseJson(init);
      const technicalAnswers = Object.fromEntries(
        (body.answers || []).map((item: any) => [item.questionId, item.answer]),
      );
      const session = await backendJson(
        `/liveroom/launch/${blueprint[1]}/phase/BLUEPRINT`,
        {
          method: 'PUT',
          body: JSON.stringify({ technicalAnswers }),
        },
      );
      return jsonResponse({
        session: transformSession(session),
        blueprint: session.blueprint,
        phase2Status: 'ready',
      });
    }

    const recommendations = path.match(
      /^\/launch\/([^/]+)\/talent-recommendations$/,
    );
    if (recommendations) {
      const data = await backendJson(
        `/liveroom/launch/${recommendations[1]}/recommendations`,
      );
      return jsonResponse(data);
    }

    const scope = path.match(/^\/launch\/([^/]+)\/scope$/);
    if (scope && method === 'POST') {
      const body = await parseJson(init);
      const workspace = await backendJson(`/liveroom/launch/${scope[1]}/room`, {
        method: 'POST',
        body: JSON.stringify({
          selectedTalent: selectedTalentFromRecommendations(
            body.selectedTalentRecommendations,
          ),
        }),
      });
      return jsonResponse(workspace.room || workspace);
    }

    if (path === '/rooms/my') {
      const rooms = await backendJson('/liveroom/business/rooms');
      return jsonResponse((rooms || []).map(transformRoom));
    }

    if (path === '/talent/rooms') {
      const entries = await backendJson('/liveroom/talent/rooms');
      return jsonResponse(
        (entries || []).map((entry: any) => ({
          ...entry,
          room: transformRoom(entry.room || entry),
        })),
      );
    }

    if (path === '/talent/enquiries' || path === '/talent/offers') {
      return jsonResponse([]);
    }

    const workspaceMatch = path.match(/^\/rooms\/([^/]+)\/workspace$/);
    if (workspaceMatch) {
      const workspace = await backendJson(
        `/liveroom/rooms/${workspaceMatch[1]}/workspace`,
      );
      return jsonResponse(transformWorkspace(workspace));
    }

    const channelMessages = path.match(
      /^\/rooms\/([^/]+)\/channels\/([^/]+)\/messages$/,
    );
    if (channelMessages && method === 'GET') {
      const workspace = transformWorkspace(
        await backendJson(`/liveroom/rooms/${channelMessages[1]}/workspace`),
      );
      return jsonResponse(
        workspace.messages.filter(
          (message: any) => message.channelId === channelMessages[2],
        ),
      );
    }
    if (channelMessages && method === 'POST') {
      const body = await parseJson(init);
      const data = await backendJson(
        `/liveroom/rooms/${channelMessages[1]}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            channelId: channelMessages[2],
            message: body.message,
          }),
        },
      );
      return jsonResponse({
        message: data.message ? transformMessage(data.message) : undefined,
        aiMessage: data.aiMessage
          ? transformMessage(data.aiMessage)
          : undefined,
      });
    }

    const documentMatch = path.match(/^\/rooms\/([^/]+)\/documents\/([^/]+)$/);
    if (documentMatch && method === 'GET') {
      return jsonResponse({
        title: decodeURIComponent(documentMatch[2]).replace(/-/g, ' '),
        documentType: decodeURIComponent(documentMatch[2]),
        content: JSON.stringify(
          {
            note: 'This document will be synced in the next LiveRoom backend phase.',
          },
          null,
          2,
        ),
      });
    }

    if (path.includes('/commands/preview')) {
      return jsonResponse({
        commandId: `placeholder-${Date.now()}`,
        action: 'not_synced',
        summary:
          'This LiveRoom command UI is preserved. Command execution will be synced in the next backend pass.',
        targets: [],
        warnings: ['Backend command sync is not enabled yet.'],
        requiresConfirmation: false,
        payload: {},
      });
    }

    if (
      path.includes('/commands/execute') ||
      path.includes('/document-permissions') ||
      path.includes('/offers') ||
      path.includes('/interviews') ||
      path.includes('/documents-zip') ||
      path.endsWith('.pdf')
    ) {
      return jsonResponse({
        message:
          'This LiveRoom action will be synced in the next backend phase.',
      });
    }

    const inviteRespond = path.match(/^\/talent\/invites\/([^/]+)\/respond$/);
    if (inviteRespond && method === 'PATCH') {
      const body = await parseJson(init);
      const data = await backendJson(
        `/liveroom/participants/${inviteRespond[1]}/respond`,
        {
          method: 'PUT',
          body: JSON.stringify({ action: body.action }),
        },
      );
      return jsonResponse(data);
    }

    return jsonResponse(
      { error: 'This LiveRoom endpoint is not synced yet.' },
      { status: 501 },
    );
  } catch (error: any) {
    return jsonResponse(
      { error: error?.message || 'LiveRoom request failed' },
      { status: 500 },
    );
  }
}

export function installLiveRoomFetchBridge() {
  if (typeof window === 'undefined') return () => {};
  fetchBridgeRefCount += 1;

  if (!restoreNativeFetch) {
    restoreNativeFetch = window.fetch;
    nativeFetch = restoreNativeFetch;
    window.fetch = ((input: FetchInput, init?: RequestInit) =>
      liveRoomApiFetch(input, init)) as typeof window.fetch;
  }

  return () => {
    fetchBridgeRefCount = Math.max(0, fetchBridgeRefCount - 1);
    if (fetchBridgeRefCount === 0 && restoreNativeFetch) {
      window.fetch = restoreNativeFetch;
      restoreNativeFetch = null;
      nativeFetch = null;
    }
  };
}

export async function liveRoomJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await liveRoomApiFetch(`/api${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data?.error || data?.message || 'LiveRoom request failed');
  return data as T;
}
