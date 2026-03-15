import type { ReactNode } from "react";
import LoadingOverlay from "./LoadingOverlay";

interface PageCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

const PageCard = ({
  title,
  subtitle,
  actions,
  loading = false,
  loadingLabel,
  children,
}: PageCardProps) => {
  return (
    <section className="relative mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <LoadingOverlay show={loading} label={loadingLabel || "Loading..."} />
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {subtitle ? <p className="mb-4 text-sm text-slate-600">{subtitle}</p> : null}
      {children}
    </section>
  );
};

export default PageCard;
