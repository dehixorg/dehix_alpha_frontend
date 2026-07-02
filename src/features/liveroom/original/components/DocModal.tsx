/* eslint-disable import/order, react/no-unescaped-entities */
import { useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { liveRoomApiFetch as fetch } from '../api/runtime';
import {
  Copy,
  Download,
  X,
  Eye,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Clock,
  Layers,
  MapPin,
  HelpCircle,
  DollarSign,
} from 'lucide-react';

const DOC_TYPE_LABELS: Record<string, string> = {
  pitch_deck: 'Pitch Deck',
  technical_deck: 'Technical Deck',
  bd_strategy: 'BD Strategy',
  sow: 'Statement of Work',
  project_brief: 'Project Brief',
  idea_validation_report: 'Idea Validation Report',
  business_requirement_document: 'Business Requirement Document',
  project_requirement_document: 'Project Requirement Document',
  mvp_scope_document: 'MVP Scope Document',
  technical_architecture_document: 'Technical Architecture Document',
  feature_list_document: 'Feature List Document',
  development_roadmap: 'Development Roadmap',
};

interface GeneratedDoc {
  _id?: string;
  title: string;
  documentType: string;
  content: string;
  messageCount?: number;
}

interface DocModalProps {
  doc: GeneratedDoc | null;
  onClose: () => void;
}

export function DocModal({ doc, onClose }: DocModalProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [doc, onClose]);

  if (!doc) return null;

  const parsedJson = (() => {
    if (!doc.content) return null;
    return lenientJsonParse(doc.content);
  })();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(doc.content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  const download = () => {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded text document');
  };

  const downloadPdf = async () => {
    if (!doc || !doc._id) return;
    setDownloadingPdf(true);
    try {
      const token = localStorage.getItem('dehix_token');
      const res = await fetch(`/api/ai/documents/${doc._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded PDF successfully!');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const label = DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-fadeIn">
      {/* Header */}
      <div className="shrink-0 border-b border-border/40 bg-card/85 px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-primary shrink-0">
            <Eye className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
              Document Preview
            </span>
          </div>
          <span className="text-border/40 hidden sm:inline">·</span>
          <span className="font-bold text-sm truncate text-foreground">
            {doc.title}
          </span>
          <span className="shrink-0 text-[10px] px-2.5 py-1 rounded border border-border bg-muted text-muted-foreground font-semibold uppercase">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copy}
            className="text-xs text-muted-foreground hover:text-foreground transition-all border border-border/50 rounded-md px-3 py-2 hover:bg-muted/50 inline-flex items-center gap-1.5 cursor-pointer font-medium bg-transparent"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={download}
            className="text-xs text-muted-foreground hover:text-foreground transition-all border border-border/50 rounded-md px-3 py-2 hover:bg-muted/55 inline-flex items-center gap-1.5 cursor-pointer font-medium bg-transparent"
          >
            <Download className="h-3.5 w-3.5" />
            Text
          </button>

          {doc._id && (
            <button
              onClick={downloadPdf}
              disabled={downloadingPdf}
              className="text-xs text-primary-foreground bg-primary hover:bg-primary/95 transition-all rounded-md px-3 py-2 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-semibold border border-transparent"
            >
              {downloadingPdf ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {downloadingPdf ? 'Generating...' : 'PDF'}
            </button>
          )}

          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-all border border-border/50 rounded-md px-3 py-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 inline-flex items-center gap-1 cursor-pointer font-medium ml-1 bg-transparent"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      </div>

      {/* Desktop workspace area: centered page on gray bg */}
      <div className="flex-1 overflow-y-auto bg-muted/40 dark:bg-muted/10 py-8 px-4 flex justify-center">
        <div className="bg-card text-foreground shadow-xl border border-border/30 rounded-xl p-8 md:p-12 w-full max-w-3xl min-h-[1000px] flex flex-col justify-between">
          {/* Paper Top Title Header */}
          <div className="border-b border-border/20 pb-6 mb-6">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              <FileText className="h-4 w-4 text-primary" />
              {label}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {doc.title}
            </h1>
          </div>

          {/* Document Text Body */}
          <div className="flex-1 my-4 overflow-x-hidden">
            {parsedJson ? (
              <JsonDocumentRenderer
                data={parsedJson}
                documentType={doc.documentType}
              />
            ) : (
              <DocumentMarkdown text={doc.content} />
            )}
          </div>

          {/* Paper Footer Details */}
          <div className="border-t border-border/20 pt-6 mt-8 flex justify-between items-center text-[10px] text-muted-foreground">
            <span>Workspace ID: {doc._id ?? 'N/A'}</span>
            <span>DEHIX Documentation Platform</span>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="shrink-0 border-t border-border/40 px-6 py-3 flex items-center justify-between bg-card/85 text-[10px] text-muted-foreground/60 shadow-inner">
        <span>Generated by DEHIX Live Room · Press Esc key to exit</span>
        <div className="flex items-center gap-3">
          <span
            className="font-semibold cursor-pointer hover:text-foreground"
            onClick={copy}
          >
            Copy to clipboard
          </span>
          <span>·</span>
          <span
            className="font-semibold cursor-pointer hover:text-foreground"
            onClick={download}
          >
            Download .txt
          </span>
        </div>
      </div>
    </div>
  );
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'heading'; level: number; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; language: string; content: string[] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'table'; headers: string[]; alignments: string[]; rows: string[][] }
  | { type: 'hr' };

function parseMarkdown(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const content: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        content.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code', language, content });
      continue;
    }

    // 2. Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 3. Headings
    if (trimmed.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2].trim();
        blocks.push({ type: 'heading', level, text: headingText });
        i++;
        continue;
      }
    }

    // 4. Blockquote
    if (trimmed.startsWith('>')) {
      const blockquoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const clean = lines[i].trim().slice(1).replace(/^\s/, '');
        blockquoteLines.push(clean);
        i++;
      }
      blocks.push({ type: 'blockquote', lines: blockquoteLines });
      continue;
    }

    // 5. Bullet List
    if (
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('• ')
    ) {
      const items: string[] = [];
      while (i < lines.length) {
        const currentTrimmed = lines[i].trim();
        if (
          currentTrimmed.startsWith('- ') ||
          currentTrimmed.startsWith('* ') ||
          currentTrimmed.startsWith('• ')
        ) {
          items.push(currentTrimmed.slice(2));
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    // 6. Numbered List
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const currentTrimmed = lines[i].trim();
        const match = currentTrimmed.match(/^\d+\.\s+(.*)$/);
        if (match) {
          items.push(match[1]);
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // 7. Table
    if (trimmed.startsWith('|')) {
      const rawRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const parts = lines[i].split('|').map((p) => p.trim());
        if (parts[0] === '') parts.shift();
        if (parts[parts.length - 1] === '') parts.pop();
        rawRows.push(parts);
        i++;
      }

      if (rawRows.length > 0) {
        const headers = rawRows[0];
        let alignments: string[] = [];
        let rows = rawRows.slice(1);

        if (
          rows.length > 0 &&
          rows[0].every((col) => /^-+:*|-*:*|-*$/.test(col))
        ) {
          alignments = rows[0].map((col) => {
            if (col.startsWith(':') && col.endsWith(':')) return 'center';
            if (col.endsWith(':')) return 'right';
            return 'left';
          });
          rows = rows.slice(1);
        } else {
          alignments = headers.map(() => 'left');
        }

        blocks.push({ type: 'table', headers, alignments, rows });
        continue;
      }
    }

    // 8. Empty line
    if (trimmed === '') {
      i++;
      continue;
    }

    // 9. Paragraph
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const nextLine = lines[i];
      const nextTrimmed = nextLine.trim();
      if (
        nextTrimmed === '' ||
        nextTrimmed.startsWith('```') ||
        nextTrimmed === '---' ||
        nextTrimmed === '***' ||
        nextTrimmed.startsWith('#') ||
        nextTrimmed.startsWith('>') ||
        nextTrimmed.startsWith('- ') ||
        nextTrimmed.startsWith('* ') ||
        /^\d+\.\s+/.test(nextTrimmed) ||
        nextTrimmed.startsWith('|')
      ) {
        break;
      }
      paragraphLines.push(nextLine);
      i++;
    }
    blocks.push({ type: 'paragraph', lines: paragraphLines });
  }

  return blocks;
}

function parseInline(text: string): ReactNode[] {
  if (!text) return [];
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|@dehixai)/g);
  return parts.map((part, idx) => {
    if (part === '@dehixai') {
      return (
        <span
          key={idx}
          className="font-bold text-primary dark:text-violet-400 underline underline-offset-2 decoration-1"
        >
          @dehixai
        </span>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-foreground/80">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="rounded px-1.5 py-0.5 text-[12px] font-mono font-semibold bg-muted border border-border/30 text-foreground/90"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function DocumentMarkdown({ text }: { text: string }) {
  const blocks = parseMarkdown(text);

  return (
    <div className="space-y-4 text-foreground/90 leading-relaxed font-sans text-sm selection:bg-primary/10">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const hClass = [
              '', // index 0 not used
              'text-2xl md:text-3xl font-black text-foreground border-b border-border/10 pb-2 mt-8 mb-4 tracking-tight', // h1
              'text-xl md:text-2xl font-extrabold text-foreground/95 mt-6 mb-3 tracking-tight', // h2
              'text-lg md:text-xl font-bold text-foreground/90 mt-5 mb-2.5 tracking-tight', // h3
              'text-base md:text-lg font-semibold text-foreground/80 mt-4 mb-2', // h4
              'text-sm md:text-base font-semibold text-foreground/75 mt-3 mb-1.5', // h5
              'text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-2 mb-1', // h6
            ][Math.min(block.level, 6)];
            return (
              <div key={index} className={hClass}>
                {parseInline(block.text)}
              </div>
            );
          }
          case 'paragraph':
            return (
              <p
                key={index}
                className="text-foreground/80 font-normal leading-relaxed text-justify md:text-left mb-3"
              >
                {parseInline(block.lines.join(' '))}
              </p>
            );
          case 'hr':
            return (
              <hr
                key={index}
                className="my-6 border-t border-border/35 dark:border-border/15"
              />
            );
          case 'blockquote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-primary/50 bg-muted/20 px-4 py-2.5 my-3 italic rounded-r text-muted-foreground/90 font-medium"
              >
                {block.lines.map((line, idx) => (
                  <p key={idx}>{parseInline(line)}</p>
                ))}
              </blockquote>
            );
          case 'list': {
            const ListTag = block.ordered ? 'ol' : 'ul';
            const listClass = block.ordered
              ? 'list-decimal pl-6 space-y-1.5 my-3'
              : 'list-disc pl-6 space-y-1.5 my-3';
            return (
              <ListTag key={index} className={listClass}>
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-foreground/80">
                    {parseInline(item)}
                  </li>
                ))}
              </ListTag>
            );
          }
          case 'code':
            return (
              <pre
                key={index}
                className="bg-muted border border-border/30 dark:border-border/15 rounded-lg p-4 font-mono text-xs overflow-x-auto my-4 text-foreground/90 shadow-inner"
              >
                <code>{block.content.join('\n')}</code>
              </pre>
            );
          case 'table': {
            return (
              <div
                key={index}
                className="overflow-x-auto my-5 border border-border/40 rounded-lg shadow-sm animate-fadeIn"
              >
                <table className="min-w-full divide-y divide-border/35 text-xs text-left">
                  <thead className="bg-muted/40 font-bold text-foreground">
                    <tr>
                      {block.headers.map((header, hIdx) => {
                        const align = block.alignments[hIdx] || 'left';
                        return (
                          <th
                            key={hIdx}
                            className={`px-4 py-2.5 font-semibold text-foreground border-r border-border/10 last:border-0 text-${align}`}
                          >
                            {parseInline(header)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 bg-background/20">
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-muted/15 transition-colors"
                      >
                        {row.map((cell, cIdx) => {
                          const align = block.alignments[cIdx] || 'left';
                          return (
                            <td
                              key={cIdx}
                              className={`px-4 py-2 text-foreground/80 border-r border-border/10 last:border-0 text-${align}`}
                            >
                              {parseInline(cell)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

function renderExecutiveSummary(execData: any) {
  if (!execData) return null;
  const {
    idea_name,
    one_line_description,
    business_goal,
    target_market,
    recommended_launch_strategy,
  } = execData;
  return (
    <div className="space-y-6 text-foreground font-sans animate-fadeIn text-left">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md">
            Executive Summary
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-foreground tracking-tight mb-2">
          {idea_name || 'Project Concept'}
        </h2>
        {one_line_description && (
          <p className="text-sm text-foreground/90 font-medium leading-relaxed italic mb-4">
            "{one_line_description}"
          </p>
        )}
        {business_goal && (
          <div className="space-y-1.5 pt-3 border-t border-border/40">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Core Business
              Goal
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {business_goal}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {target_market && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Target Market
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              {target_market}
            </div>
          </div>
        )}
        {recommended_launch_strategy && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Launch Strategy
            </span>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-1">
              <Award className="h-3.5 w-3.5 text-primary" />
              {recommended_launch_strategy}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderMvpScope(mvpData: any) {
  if (!mvpData) return null;
  const mustHaves = mvpData.must_have_features || [];
  const shouldHaves = mvpData.should_have_features || [];
  const futureFeatures = mvpData.future_features || [];
  const excluded = mvpData.excluded_from_mvp || [];

  return (
    <div className="space-y-6 text-foreground font-sans animate-fadeIn text-left">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md mb-4">
          MVP Scope Definition
        </span>
        <p className="text-xs text-muted-foreground mb-4">
          Detailed functional priority specifications scoped for launch.
        </p>

        <div className="space-y-6">
          {/* Must Have Features */}
          {mustHaves.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Must-Have
                Features (V1 Core)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {mustHaves.map((item: any, idx: number) => {
                  const name = typeof item === 'string' ? item : item.feature;
                  const purpose =
                    typeof item === 'string' ? null : item.purpose;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 border-l-4 border-l-emerald-500"
                    >
                      <div className="text-xs font-bold text-foreground">
                        {name}
                      </div>
                      {purpose && (
                        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {purpose}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Should Have Features */}
          {shouldHaves.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-500" /> Should-Have
                Features
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {shouldHaves.map((item: any, idx: number) => {
                  const name = typeof item === 'string' ? item : item.feature;
                  const purpose =
                    typeof item === 'string' ? null : item.purpose;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 border-l-4 border-l-blue-500"
                    >
                      <div className="text-xs font-bold text-foreground">
                        {name}
                      </div>
                      {purpose && (
                        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {purpose}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Future / Nice to Have */}
          {futureFeatures.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Nice-to-Have /
                Future Rollout (V2)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {futureFeatures.map((item: any, idx: number) => {
                  const name = typeof item === 'string' ? item : item.feature;
                  const reason =
                    typeof item === 'string'
                      ? null
                      : (item.reason ?? item.purpose);
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 border-l-4 border-l-amber-500"
                    >
                      <div className="text-xs font-bold text-foreground">
                        {name}
                      </div>
                      {reason && (
                        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {reason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Excluded From MVP */}
          {excluded.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500" /> Strictly
                Excluded from MVP Scope
              </h3>
              <div className="flex flex-wrap gap-2">
                {excluded.map((item: any, idx: number) => {
                  const name =
                    typeof item === 'string'
                      ? item
                      : (item.feature ?? item.item);
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderTechnicalArchitecture(techData: any) {
  if (!techData) return null;
  const stack = techData.recommended_stack || {};
  const components = techData.system_components || [];
  const apis = techData.api_modules || [];
  const dbEntities = techData.database_entities || [];

  return (
    <div className="space-y-6 text-foreground font-sans animate-fadeIn text-left">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md mb-4">
          Technical Architecture
        </span>

        {/* Stack Grid */}
        {Object.keys(stack).length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              Recommended Tech Stack
            </h3>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {Object.entries(stack).map(([layer, tech]: [string, any]) => {
                const label = layer
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                const techVal = Array.isArray(tech)
                  ? tech.join(', ')
                  : String(tech);
                return (
                  <div
                    key={layer}
                    className="p-3 border border-border bg-background/50 rounded-xl space-y-1"
                  >
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="text-xs font-bold text-foreground">
                      {techVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Components & Diagrams */}
        {components.length > 0 && (
          <div className="space-y-3 mb-6 pt-4 border-t border-border/40">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              System Components
            </h3>
            <div className="space-y-2">
              {components.map((c: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 rounded-xl border border-border bg-background/30"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/15 text-primary shrink-0 self-start">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {c.component}
                    </div>
                    {c.purpose && (
                      <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {c.purpose}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API & Database Grid */}
        {(apis.length > 0 || dbEntities.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-border/40">
            {apis.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Core API Modules
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {apis.map((api: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-muted border border-border/50 text-[11px] font-mono font-medium text-foreground/80"
                    >
                      {api}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dbEntities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Database Entities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {dbEntities.map((ent: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-muted border border-border/50 text-[11px] font-mono font-medium text-foreground/80"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderFreelancerHiringBrief(teamData: any) {
  if (!teamData) return null;
  const recommended = teamData.recommended_team || [];
  const minimum = teamData.minimum_team || [];

  return (
    <div className="space-y-6 text-foreground font-sans animate-fadeIn text-left">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md mb-4">
          Freelancer Hiring Brief & Team Requirements
        </span>

        {minimum.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-amber-500/25 bg-amber-500/5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-2">
              <Users className="h-3.5 w-3.5" /> Minimum Viable Launch Team
            </h4>
            <div className="flex flex-wrap gap-2">
              {minimum.map((role: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {recommended.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3">
              Recommended Squad & Positions
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {recommended.map((member: any, idx: number) => {
                const roleName = member.role || 'Developer';
                const resps = Array.isArray(member.responsibilities)
                  ? member.responsibilities
                  : typeof member.responsibilities === 'string'
                    ? member.responsibilities.split('\n').filter(Boolean)
                    : [];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-background/40 hover:border-border/60 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-foreground flex items-center gap-1.5 mb-2 border-b border-border/10 pb-1.5">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        {roleName}
                      </div>
                      {resps.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-foreground/80 leading-relaxed">
                          {resps.map((r: string, rIdx: number) => (
                            <li key={rIdx}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderRoadmapBudget(roadmapData: any, costData: any) {
  const hasRoadmap = roadmapData && Object.keys(roadmapData).length > 0;
  const hasCost = costData && Object.keys(costData).length > 0;

  return (
    <div className="space-y-6 text-foreground font-sans animate-fadeIn text-left">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md mb-4">
          Roadmap & Cost Estimation
        </span>

        {/* Cost section */}
        {hasCost && (
          <div className="space-y-4 mb-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-primary" /> Cost Estimation &
              Capital Requirement
            </h3>

            {costData.mvp_budget && (
              <div className="grid gap-3 grid-cols-3">
                {[
                  {
                    key: 'minimum',
                    label: 'Minimum Budget',
                    color: 'border-blue-500/20 bg-blue-500/5',
                    text: costData.mvp_budget.minimum,
                  },
                  {
                    key: 'expected',
                    label: 'Expected Budget',
                    color: 'border-emerald-500/30 bg-emerald-500/5',
                    text: costData.mvp_budget.expected,
                  },
                  {
                    key: 'high_end',
                    label: 'High-End Budget',
                    color: 'border-purple-500/20 bg-purple-500/5',
                    text: costData.mvp_budget.high_end,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-4 rounded-xl border ${item.color} text-center space-y-1`}
                  >
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </span>
                    <div className="text-sm font-black text-foreground">
                      {item.text || 'TBD'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {costData.monthly_operational_cost && (
              <div className="pt-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                  Estimated Monthly Operations
                </h4>
                <div className="grid gap-3 grid-cols-3">
                  {Object.entries(costData.monthly_operational_cost).map(
                    ([tier, value]: [string, any]) => {
                      const label = tier
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div
                          key={tier}
                          className="p-3 border border-border bg-background/50 rounded-lg text-center"
                        >
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                            {label}
                          </span>
                          <div className="text-xs font-bold text-foreground mt-0.5">
                            {value || 'TBD'}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {costData.major_cost_drivers &&
              costData.major_cost_drivers.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Key Cost Drivers
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/80">
                    {costData.major_cost_drivers.map(
                      (driver: string, idx: number) => (
                        <li key={idx}>{driver}</li>
                      ),
                    )}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* Roadmap section */}
        {hasRoadmap && (
          <div className="pt-6 border-t border-border/40 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" /> Implementation Timeline
              Roadmap
            </h3>

            <div className="space-y-4 relative pl-4 border-l border-border/60">
              {Object.entries(roadmapData).map(
                ([phaseKey, phaseVal]: [string, any]) => {
                  const phaseTitle = phaseKey
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const duration = phaseVal.duration || 'TBD';
                  const deliverables = phaseVal.deliverables || [];

                  return (
                    <div key={phaseKey} className="relative space-y-1">
                      {/* Circle marker */}
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />

                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className="text-xs font-black text-foreground">
                          {phaseTitle}
                        </h4>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {duration}
                        </span>
                      </div>

                      {deliverables.length > 0 && (
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-muted-foreground leading-relaxed">
                          {deliverables.map((del: string, dIdx: number) => (
                            <li key={dIdx}>{del}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JsonDocumentRenderer({
  data,
  documentType,
}: {
  data: any;
  documentType?: string;
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const isAnalysis =
    data.idea_summary !== undefined ||
    data.research_analysis !== undefined ||
    documentType === 'business_validation';

  if (isAnalysis) {
    const research = data.research_analysis ?? {};
    const overallScore = research.overall_score;
    const finalVerdict = research.final_verdict;
    const verdictReasoning = research.verdict_reasoning;
    const swot = research.swot;
    const dimensionalScores = research.dimensional_scores;
    const clarifyingQuestions = data.clarifying_questions ?? [];

    return (
      <div className="space-y-8 text-foreground font-sans animate-fadeIn text-left">
        {/* Core Summary Block */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Lightbulb className="w-24 h-24" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {data.region_used && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md">
                <MapPin className="h-3 w-3" /> Region: {data.region_used}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border/50 px-2.5 py-1 rounded-md">
              <FileText className="h-3 w-3" /> Business Validation
            </span>
          </div>

          <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-1">
            Project Idea Summary
          </h2>
          <p className="text-base text-foreground/90 font-medium leading-relaxed">
            {data.idea_summary || 'No summary provided.'}
          </p>
        </div>

        {/* Score and Verdict row */}
        {(overallScore !== undefined || finalVerdict || dimensionalScores) && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overall Score / Verdict */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" /> Overall Assessment
                </h3>
                {overallScore !== undefined && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-muted"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="stroke-primary"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={
                            2 * Math.PI * 34 * (1 - overallScore / 10)
                          }
                        />
                      </svg>
                      <span className="absolute text-lg font-black text-foreground">
                        {overallScore}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Validation Score
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Derived from concept clarity, demand, and execution
                        feasibility.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {finalVerdict && (
                <div className="border-t border-border/40 pt-4 mt-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Final Verdict
                  </div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    {finalVerdict}
                  </div>
                  {verdictReasoning && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {verdictReasoning}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Dimensional Scores */}
            {dimensionalScores && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Dimensional Scores
                </h3>
                <div className="space-y-3.5">
                  {Object.entries(dimensionalScores).map(
                    ([key, scoreVal]: [string, any]) => {
                      const label = key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      const score = Number(scoreVal) || 0;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-foreground/90">{label}</span>
                            <span className="text-muted-foreground font-mono">
                              {score}/10
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${score * 10}%` }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SWOT Analysis */}
        {swot && (
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> SWOT Matrix
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Strengths */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Strengths
                </h4>
                {swot.strengths && swot.strengths.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/85 leading-relaxed">
                    {swot.strengths.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">
                    No strengths listed.
                  </p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Weaknesses
                </h4>
                {swot.weaknesses && swot.weaknesses.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/85 leading-relaxed">
                    {swot.weaknesses.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">
                    No weaknesses listed.
                  </p>
                )}
              </div>

              {/* Opportunities */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Opportunities
                </h4>
                {swot.opportunities && swot.opportunities.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/85 leading-relaxed">
                    {swot.opportunities.map((o: string, idx: number) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">
                    No opportunities listed.
                  </p>
                )}
              </div>

              {/* Threats */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Threats
                </h4>
                {swot.threats && swot.threats.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/85 leading-relaxed">
                    {swot.threats.map((t: string, idx: number) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">
                    No threats listed.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis items */}
        <div className="space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            Market Research & Strategy
          </h3>
          <div className="space-y-4">
            {[
              {
                key: 'market_demand',
                title: 'Market Demand Analysis',
                icon: <TrendingUp className="h-4 w-4" />,
              },
              {
                key: 'target_audience',
                title: 'Target Audience',
                icon: <Users className="h-4 w-4" />,
              },
              {
                key: 'competitor_analysis',
                title: 'Competitor Landscape',
                icon: <Layers className="h-4 w-4" />,
              },
              {
                key: 'competitive_moat',
                title: 'Competitive Moat',
                icon: <Award className="h-4 w-4" />,
              },
              {
                key: 'revenue_model',
                title: 'Revenue Model',
                icon: <DollarSign className="h-4 w-4" />,
              },
              {
                key: 'unit_economics',
                title: 'Unit Economics',
                icon: <DollarSign className="h-4 w-4" />,
              },
              {
                key: 'cost_estimation',
                title: 'Cost Estimation & Capital Requirement',
                icon: <DollarSign className="h-4 w-4" />,
              },
              {
                key: 'go_to_market_strategy',
                title: 'Go To Market Strategy',
                icon: <Clock className="h-4 w-4" />,
              },
            ].map(({ key, title, icon }) => {
              const textContent = research[key];
              if (!textContent) return null;
              return (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2 hover:border-border/60 transition-colors"
                >
                  <h4 className="text-xs font-bold text-foreground/90 flex items-center gap-2 border-b border-border/10 pb-1.5">
                    <span className="p-1 rounded bg-primary/10 text-primary border border-primary/15">
                      {icon}
                    </span>
                    {title}
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed text-justify whitespace-pre-line">
                    {textContent}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* List items (Risks, Suggestions, Assumptions) */}
        {[
          {
            key: 'risks',
            title: 'Identified Risks',
            border: 'border-l-rose-500',
            icon: <AlertTriangle className="h-4 w-4 text-rose-500" />,
          },
          {
            key: 'suggestions',
            title: 'Strategic Suggestions',
            border: 'border-l-blue-500',
            icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
          },
          {
            key: 'assumptions',
            title: 'Key Assumptions',
            border: 'border-l-primary/60',
            icon: <CheckCircle className="h-4 w-4 text-primary" />,
          },
        ].map(({ key, title, border, icon }) => {
          const listItems = research[key] || [];
          if (!listItems || listItems.length === 0) return null;
          return (
            <div key={key} className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                {icon} {title}
              </h3>
              <div className="space-y-2">
                {listItems.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className={`rounded-lg border border-border bg-card/40 p-3.5 text-xs leading-relaxed text-foreground/80 border-l-4 ${border} shadow-sm`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Clarifying Questions */}
        {clarifyingQuestions.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" /> Clarifying Questions / Next
              Steps
            </h3>
            <p className="text-xs text-muted-foreground">
              To further refine the validation model, consider clarifying the
              following points:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-foreground/80 leading-relaxed font-semibold">
              {clarifyingQuestions.map((q: string, idx: number) => (
                <li key={idx}>{q}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  // 1. Check if it's the full business blueprint
  const isFullBlueprint =
    documentType === 'business_blueprint' ||
    documentType === 'full_business_blueprint' ||
    data.executive_summary !== undefined;

  if (isFullBlueprint) {
    const tabs = [
      { id: 'overview', label: 'Executive Summary & Strategy' },
      { id: 'scope', label: 'MVP Features & Scope' },
      { id: 'architecture', label: 'Technical Architecture' },
      { id: 'roadmap', label: 'Roadmap, Cost & Team' },
    ];

    return (
      <div className="space-y-6 text-foreground font-sans animate-fadeIn text-left">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {renderExecutiveSummary(data.executive_summary)}

              {data.problem_definition && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                  <h4 className="text-xs font-bold text-foreground/90 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" /> Problem
                    Statement
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {data.problem_definition.problem_statement}
                  </p>
                  {data.problem_definition.current_alternatives?.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Current Alternatives
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/70">
                        {data.problem_definition.current_alternatives.map(
                          (alt: string, idx: number) => (
                            <li key={idx}>{alt}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {data.target_users?.primary_users?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Target Audience
                    Personas
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {data.target_users.primary_users.map(
                      (user: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-border bg-card p-4 space-y-2"
                        >
                          <div className="text-xs font-bold text-foreground">
                            {user.persona}
                          </div>
                          {user.description && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {user.description}
                            </p>
                          )}
                          {user.pain_points?.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                                Pain Points
                              </span>
                              <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-foreground/75">
                                {user.pain_points.map(
                                  (pt: string, pIdx: number) => (
                                    <li key={pIdx}>{pt}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {data.product_strategy && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" /> Product
                    Strategy & Value Prop
                  </h4>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Core Value Proposition
                    </span>
                    <p className="text-xs text-foreground/80 leading-relaxed mt-0.5">
                      {data.product_strategy.core_value_proposition}
                    </p>
                  </div>
                  {data.product_strategy.competitive_advantage?.length > 0 && (
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        Competitive Advantage
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-xs text-foreground/75 mt-0.5">
                        {data.product_strategy.competitive_advantage.map(
                          (adv: string, idx: number) => (
                            <li key={idx}>{adv}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'scope' && (
            <div className="space-y-6">
              {renderMvpScope(data.mvp_definition || data.mvp_scope)}

              {data.user_journey && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" /> User Journeys &
                    Flows
                  </h4>
                  {Object.entries(data.user_journey).map(
                    ([flowKey, flowSteps]: [string, any]) => {
                      const flowTitle = flowKey
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div key={flowKey} className="space-y-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {flowTitle}
                          </span>
                          <div className="flex items-center flex-wrap gap-2">
                            {flowSteps.map((step: string, sIdx: number) => (
                              <div
                                key={sIdx}
                                className="flex items-center gap-2"
                              >
                                <span className="px-2.5 py-1 rounded bg-muted border border-border text-[11px] font-medium text-foreground/85">
                                  {step}
                                </span>
                                {sIdx < flowSteps.length - 1 && (
                                  <span className="text-muted-foreground">
                                    →
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {renderTechnicalArchitecture(data.technical_architecture)}

              {data.security_and_compliance && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" /> Security &
                    Compliance Requirements
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: 'Security',
                        list: data.security_and_compliance
                          .security_requirements,
                        color: 'border-rose-500/20 bg-rose-500/5',
                      },
                      {
                        label: 'Privacy',
                        list: data.security_and_compliance.privacy_requirements,
                        color: 'border-blue-500/20 bg-blue-500/5',
                      },
                      {
                        label: 'Compliance',
                        list: data.security_and_compliance
                          .compliance_requirements,
                        color: 'border-amber-500/20 bg-amber-500/5',
                      },
                    ].map((sec) => (
                      <div
                        key={sec.label}
                        className={`p-4 rounded-xl border ${sec.color} space-y-1.5`}
                      >
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                          {sec.label}
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-muted-foreground">
                          {sec.list?.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              {renderRoadmapBudget(
                data.development_roadmap,
                data.cost_estimation,
              )}
              {renderFreelancerHiringBrief(data.team_requirements)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Individual sub-documents routing
  if (documentType === 'executive_summary' || data.idea_name !== undefined) {
    return renderExecutiveSummary(data);
  }

  if (documentType === 'mvp_scope' || data.must_have_features !== undefined) {
    return renderMvpScope(data);
  }

  if (
    documentType === 'technical_architecture' ||
    data.recommended_stack !== undefined
  ) {
    return renderTechnicalArchitecture(data);
  }

  if (
    documentType === 'freelancer_hiring_brief' ||
    data.recommended_team !== undefined
  ) {
    return renderFreelancerHiringBrief(data);
  }

  if (
    documentType === 'roadmap_budget' ||
    data.development_roadmap !== undefined ||
    data.cost_estimation !== undefined
  ) {
    return renderRoadmapBudget(
      data.development_roadmap || data,
      data.cost_estimation || data,
    );
  }

  // Generic JSON Renderer fallback (useful for blueprint or other nested documents)
  return (
    <div className="space-y-6 text-foreground font-sans text-xs animate-fadeIn text-left">
      <div className="p-4 border border-border bg-card rounded-xl shadow-sm mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-md">
          Generic Data Document
        </span>
        <p className="text-xs text-muted-foreground mt-2">
          Parsed from raw structured data payload.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(data).map(([key, val]) => {
          const title = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          if (val === null || val === undefined) return null;

          // 1. Primitive values
          if (typeof val !== 'object') {
            return (
              <div
                key={key}
                className="p-4 border border-border bg-card rounded-xl shadow-sm space-y-1"
              >
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="text-xs text-foreground/85 leading-relaxed">
                  {String(val)}
                </p>
              </div>
            );
          }

          // 2. Arrays of primitives
          if (
            Array.isArray(val) &&
            val.every((item) => typeof item !== 'object')
          ) {
            return (
              <div
                key={key}
                className="p-4 border border-border bg-card rounded-xl shadow-sm space-y-2"
              >
                <h3 className="font-bold text-foreground">{title}</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-foreground/85">
                  {val.map((item, idx) => (
                    <li key={idx}>{String(item)}</li>
                  ))}
                </ul>
              </div>
            );
          }

          // 3. Arrays of objects -> table
          if (
            Array.isArray(val) &&
            val.every((item) => typeof item === 'object' && item !== null)
          ) {
            const headers = Array.from(
              new Set(val.flatMap((item) => Object.keys(item))),
            );
            if (headers.length === 0) return null;
            return (
              <div
                key={key}
                className="p-4 border border-border bg-card rounded-xl shadow-sm space-y-3 animate-fadeIn"
              >
                <h3 className="font-bold text-foreground">{title}</h3>
                <div className="overflow-x-auto border border-border/40 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-border/30 text-left text-xs">
                    <thead className="bg-muted/40 font-bold text-foreground">
                      <tr>
                        {headers.map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 border-r border-border/10 font-bold capitalize"
                          >
                            {h.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {val.map((rowItem: any, rIdx: number) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-muted/15 transition-colors"
                        >
                          {headers.map((h) => (
                            <td
                              key={h}
                              className="px-3 py-2 border-r border-border/10 text-foreground/80"
                            >
                              {typeof rowItem[h] === 'object'
                                ? JSON.stringify(rowItem[h])
                                : String(rowItem[h] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // 4. Nested object
          if (typeof val === 'object' && val !== null) {
            return (
              <div
                key={key}
                className="p-4 border border-border bg-card rounded-xl shadow-sm space-y-3"
              >
                <h3 className="font-bold text-foreground">{title}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(val).map(([subKey, subVal]) => {
                    const subTitle = subKey
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <div
                        key={subKey}
                        className="p-3 border border-border/30 bg-background/30 rounded-lg space-y-0.5 animate-fadeIn"
                      >
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          {subTitle}
                        </span>
                        <div className="text-xs text-foreground/90">
                          {typeof subVal === 'object'
                            ? JSON.stringify(subVal)
                            : String(subVal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function lenientJsonParse(str: string): any {
  if (!str) return null;
  let cleaned = str.trim();

  // 1. Remove markdown code block wrappers if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n/, '');
    cleaned = cleaned.replace(/\n```$/, '');
    cleaned = cleaned.trim();
  }

  // 2. Remove trailing AI context trim notices
  cleaned = cleaned.replace(/\n\.\.\.\[trimmed for AI context\]$/, '');
  cleaned = cleaned.trim();

  if (!cleaned.startsWith('{')) return null;

  // 3. Try standard parsing
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // 4. Fallback to unbalanced brace/bracket recovery
    const stack: ('{' | '[')[] = [];
    let inString = false;
    let escaped = false;

    for (let idx = 0; idx < cleaned.length; idx++) {
      const char = cleaned[idx];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') {
          stack.push('{');
        } else if (char === '[') {
          stack.push('[');
        } else if (char === '}') {
          if (stack[stack.length - 1] === '{') stack.pop();
        } else if (char === ']') {
          if (stack[stack.length - 1] === '[') stack.pop();
        }
      }
    }

    let correction = '';
    if (inString) {
      correction += '"';
    }
    while (stack.length > 0) {
      const top = stack.pop();
      if (top === '{') {
        correction += '}';
      } else if (top === '[') {
        correction += ']';
      }
    }

    try {
      return JSON.parse(cleaned + correction);
    } catch (e2) {
      // 5. Hard fallback: regex extraction of keys for Business Validation schemas
      const result: any = {};

      const summaryMatch = cleaned.match(
        /"idea_summary"\s*:\s*"((?:[^"\\]|\\.)*)"/,
      );
      if (summaryMatch) {
        result.idea_summary = decodeJsonString(summaryMatch[1]);
      }

      const regionMatch = cleaned.match(
        /"region_used"\s*:\s*"((?:[^"\\]|\\.)*)"/,
      );
      if (regionMatch) {
        result.region_used = decodeJsonString(regionMatch[1]);
      }

      const researchMatch = cleaned.match(
        /"research_analysis"\s*:\s*\{([\s\S]*)$/,
      );
      if (researchMatch) {
        const researchContent = researchMatch[1];
        result.research_analysis = {};

        const extractField = (key: string) => {
          const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
          const m = researchContent.match(regex);
          if (m) {
            result.research_analysis[key] = decodeJsonString(m[1]);
          }
        };

        extractField('market_demand');
        extractField('target_audience');
        extractField('competitor_analysis');
        extractField('competitive_moat');
        extractField('revenue_model');
        extractField('unit_economics');
        extractField('cost_estimation');
        extractField('go_to_market_strategy');
        extractField('final_verdict');
        extractField('verdict_reasoning');

        const scoreMatch = researchContent.match(
          /"overall_score"\s*:\s*([0-9.]+)/,
        );
        if (scoreMatch) {
          result.research_analysis.overall_score = parseFloat(scoreMatch[1]);
        }

        const swotMatch = researchContent.match(/"swot"\s*:\s*\{([\s\S]*?)\}/);
        if (swotMatch) {
          const swotContent = swotMatch[1];
          result.research_analysis.swot = {};

          const extractList = (key: string) => {
            const regex = new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`);
            const m = swotContent.match(regex);
            if (m) {
              result.research_analysis.swot[key] = m[1]
                .split(',')
                .map((item) =>
                  item.trim().replace(/^"/, '').replace(/"$/, '').trim(),
                )
                .filter(Boolean);
            }
          };

          extractList('strengths');
          extractList('weaknesses');
          extractList('opportunities');
          extractList('threats');
        }

        const dimMatch = researchContent.match(
          /"dimensional_scores"\s*:\s*\{([\s\S]*?)\}/,
        );
        if (dimMatch) {
          const dimContent = dimMatch[1];
          result.research_analysis.dimensional_scores = {};
          const itemRegex = /"([^"]+)"\s*:\s*([0-9.]+)/g;
          let m;
          while ((m = itemRegex.exec(dimContent)) !== null) {
            result.research_analysis.dimensional_scores[m[1]] = parseFloat(
              m[2],
            );
          }
        }
      }

      const cqMatch = cleaned.match(
        /"clarifying_questions"\s*:\s*\[([\s\S]*?)\]/,
      );
      if (cqMatch) {
        result.clarifying_questions = cqMatch[1]
          .split(',')
          .map((item) => item.trim().replace(/^"/, '').replace(/"$/, '').trim())
          .filter(Boolean);
      }

      if (Object.keys(result).length > 0) {
        return result;
      }
    }
  }
  return null;
}

function decodeJsonString(str: string): string {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}
