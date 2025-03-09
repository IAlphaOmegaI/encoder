import { cn } from "../../lib/utils";
import type { ComponentProps } from "react";
export type TableProps = ComponentProps<"table">;

export const Table = ({ className, ...props }: TableProps) => (
  <div
    className={cn(
      "scrollbar-hide relative w-full overflow-x-auto rounded-2xl",
      className,
    )}
  >
    <table
      className={cn("w-full max-w-full caption-bottom overflow-hidden text-sm")}
      {...props}
    />
  </div>
);

export type TableHeaderProps = ComponentProps<"thead">;

export const TableHeader = ({ className, ...props }: TableHeaderProps) => (
  <thead
    className={cn(
      "[&_tr]:!bg-transparent overflow-hidden rounded-t-lg [&_tr]:border-b-border",
      className,
    )}
    {...props}
  />
);

export type TableBodyProps = ComponentProps<"tbody">;

export const TableBody = ({ className, ...props }: TableBodyProps) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

export type TableFooterProps = ComponentProps<"tfoot">;

export const TableFooter = ({ className, ...props }: TableFooterProps) => (
  <tfoot
    className={cn(
      "border-t bg-background-dimmed/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
);

export type TableRowProps = ComponentProps<"tr">;

export const TableRow = ({ className, ...props }: TableRowProps) => (
  <tr
    className={cn("border-border border-b transition-colors", className)}
    {...props}
  />
);

export type TableHeadProps = ComponentProps<"th">;

export const TableHead = ({ className, ...props }: TableHeadProps) => (
  <th
    className={cn(
      "px-4 text-left align-middle font-body font-medium text-foreground-dimmed [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
);

export type TableCellProps = ComponentProps<"td">;

export const TableCell = ({ className, ...props }: TableCellProps) => (
  <td
    className={cn(
      "h-12 px-4 py-2 align-middle [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
);

export type TableCaptionProps = ComponentProps<"caption">;

export const TableCaption = ({ className, ...props }: TableCaptionProps) => (
  <caption
    className={cn("mt-4 text-foreground-dimmed text-sm", className)}
    {...props}
  />
);
