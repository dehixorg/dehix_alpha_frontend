import { ReputationRing } from './ReputationRing';
import { StatusBadge } from './StatusBadge';

interface Credential {
  _id: string;
  skillDomain: string;
  level: number;
  reputationScore: number;
  status: 'verified' | 'disputed' | 'revoked';
  githubScore: number;
  interviewScore: number;
  projectsCompleted: number;
  issuedAt: string;
}

interface Props {
  credential: Credential;
  compact?: boolean;
}

export function SBTCredentialCard({ credential, compact = false }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border/60 card p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg group ${compact ? 'p-3' : ''}`}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
              L{credential.level} SBT
            </span>
            <StatusBadge status={credential.status} />
          </div>
          <p className="font-semibold text-foreground text-sm leading-tight truncate">
            {credential.skillDomain}
          </p>
          {!compact && (
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground/70 font-medium">
                  {credential.githubScore}
                </span>{' '}
                GitHub
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground/70 font-medium">
                  {credential.interviewScore}
                </span>{' '}
                Interview
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground/70 font-medium">
                  {credential.projectsCompleted}
                </span>{' '}
                Projects
              </div>
            </div>
          )}
        </div>
        <ReputationRing
          score={credential.reputationScore}
          size={compact ? 48 : 56}
        />
      </div>
    </div>
  );
}
