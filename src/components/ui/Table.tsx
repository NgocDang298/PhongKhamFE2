import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full min-w-0 grid overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <table className={cn("min-w-full w-full border-collapse border-spacing-0 text-left mb-[-1px]", className)}>
          {children}
        </table>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">{children}</thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        "transition-all duration-200 group",
        onClick && "cursor-pointer hover:bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-6 py-4 !text-nowrap text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap",
        className
      )}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn("px-6 !text-nowrap py-4 text-sm text-gray-600 leading-relaxed", className)}>
      {children}
    </td>
  );
}
