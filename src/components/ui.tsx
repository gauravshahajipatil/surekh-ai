import type { ReactNode, ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw, SearchX, X } from 'lucide-react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'; size?: 'sm' | 'md' | 'lg' }) {
  return <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>{children}</button>;
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'pink' | 'blue' }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>;
}
export function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <section className={`card ${className}`} {...props}>{children}</section>;
}
export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>;
}
export function LoadingState({ label = 'Loading workspace' }: { label?: string }) {
  return <div className="state-block"><LoaderCircle className="spin" size={25} /><span>{label}…</span></div>;
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="state-block state-error"><AlertCircle size={22} /><div><strong>We couldn’t load this view</strong><p>{message}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}><RefreshCw size={14} /> Try again</Button>}</div></div>;
}
export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><SearchX size={22} /></div><strong>{title}</strong><p>{body}</p>{action}</div>;
}
export function Modal({ title, subtitle, children, onClose, wide = false }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></div>{children}</div></div>;
}
export function InlineNotice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' | 'success' | 'error' }) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;
  return <div className={`inline-notice notice-${tone}`}><Icon size={17} /><div>{children}</div></div>;
}
export function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <div className="section-title"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>;
}
export function DataState({ loading, error, reload, empty, children }: { loading: boolean; error: string | null; reload: () => void; empty?: boolean; children: ReactNode }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (empty) return <EmptyState title="Nothing here yet" body="Records will appear here after you add them or connect the required service." />;
  return <>{children}</>;
}
export function FormField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="form-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
export function currency(value: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0); }
export function dateLabel(value?: string | null) { if (!value) return 'Not recorded'; const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
export function shortDate(value?: string | null) { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }
export function toneFor(value?: string) {
  const v = (value || '').toUpperCase();
  if (['COMPLETED','APPROVED','PAID','RESOLVED','ACTIVE','LOW','CORRECT','SUBMITTED'].includes(v)) return 'green' as const;
  if (['CRITICAL','URGENT','OVERDUE','OFFLINE','FAILED','REJECTED','SUSPENDED'].includes(v)) return 'red' as const;
  if (['HIGH','OPEN','IN_REVIEW','IN_PROGRESS','DEGRADED','PARTIALLY_PAID','ACKNOWLEDGED','UNDER_REVIEW'].includes(v)) return 'amber' as const;
  if (['MEDIUM','PLANNING','DRAFT','PROPOSED','DEMO_ONLY'].includes(v)) return 'blue' as const;
  return 'neutral' as const;
}
export function initials(name: string) { return name.split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase(); }
