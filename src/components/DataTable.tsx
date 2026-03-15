import type { ReactNode } from "react";

export const DataTable = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse overflow-hidden rounded-lg">{children}</table>
  </div>
);

export const HeadCell = ({ children }: { children: ReactNode }) => (
  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
    {children}
  </th>
);

export const Cell = ({ children, align = "left" }: { children: ReactNode; align?: "left" | "center" }) => (
  <td
    className={`border border-slate-200 px-3 py-2 text-sm text-slate-700 ${
      align === "center" ? "text-center" : ""
    }`}
  >
    {children}
  </td>
);

export const EmptyRow = ({ colSpan, message }: { colSpan: number; message: string }) => (
  <tr>
    <td className="border border-slate-200 px-3 py-6 text-center text-sm text-slate-500" colSpan={colSpan}>
      {message}
    </td>
  </tr>
);
