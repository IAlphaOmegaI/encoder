import { Slot } from "@radix-ui/react-slot";
import type { ClassList } from "@zenncore/types";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "box-border inline-flex w-fit cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-lg px-2.5 py-2 text-sm transition-all duration-300 active:scale-95",
  {
    variants: {
      variant: {
        primary:
          "group gap-1.5 bg-gray-900 outline-2 outline-primary-600 outline-offset-2 transition-all duration-300 ease-in-out [background-image:radial-gradient(76%_151%_at_52%_-52%,rgba(255,255,255,0.9)_0%,transparent_100%)] [box-shadow:rgba(255,255,255,0.3)_0px_1px_0px_0px_inset,theme(colors.gray.950)_0px_0px_0px_1px] hover:brightness-125 focus-visible:outline active:brightness-95 disabled:bg-gray-200 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:hover:brightness-100 dark:border-gray-300 dark:border-t",
        default:
          "border-[1.5px] bg-gradient-to-b py-1.5 shadow-[inset_0px_1px_1px_0px_rgba(255,255,255,0.7)] transition-all duration-300",
        soft: "backdrop-blur-lg",
        outline: "rounded-full border-2 px-4 backdrop-blur-lg",
        ghost: "",
        flat: "rounded-full px-4",
      },
      size: {
        icon: "flex size-8 items-center justify-center rounded-lg p-2",
      },
      color: {
        primary: "",
        secondary: "",
        accent: "",
        emphasis: "",
        neutral: "",
        error: "",
        success: "",
        warning: "",
        info: "",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        color: "primary",
        className:
          "bg-primary [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--primary-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "secondary",
        className:
          "bg-secondary [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--secondary-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "emphasis",
        className:
          "bg-emphasis [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--emphasis-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "accent",
        className:
          "bg-accent [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--accent-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "neutral",
        className:
          "bg-neutral [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--neutral-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "error",
        className:
          "bg-error [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--error-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "success",
        className:
          "bg-success [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--success-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "warning",
        className:
          "bg-warning [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--warning-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "primary",
        color: "info",
        className:
          "bg-info [box-shadow:rgba(255,255,255,1)_0px_1px_0px_0px_inset,var(--info-dimmed)_0px_0px_0px_1px]",
      },
      {
        variant: "default",
        color: "primary",
        className: "border-primary from-primary-rich to-primary",
      },
      {
        variant: "default",
        color: "secondary",
        className: "border-secondary from-secondary-rich to-secondary",
      },
      {
        variant: "default",
        color: "neutral",
        className: "border-neutral from-neutral-rich to-neutral",
      },
      {
        variant: "default",
        color: "emphasis",
        className: "border-emphasis from-emphasis-rich to-emphasis",
      },
      {
        variant: "default",
        color: "accent",
        className: "border-accent from-accent-rich to-accent",
      },
      {
        variant: "default",
        color: "error",
        className: "border-error from-error-rich to-error",
      },
      {
        variant: "default",
        color: "success",
        className: "border-success from-success-rich to-success",
      },
      {
        variant: "default",
        color: "warning",
        className: "border-warning from-warning-rich to-warning",
      },
      {
        variant: "default",
        color: "info",
        className: "border-info from-info-rich to-info",
      },
      {
        variant: "soft",
        color: "primary",
        className: "border-primary/60 bg-primary/10 hover:bg-primary/20",
      },
      {
        variant: "soft",
        color: "secondary",
        className: "border-secondary/60 bg-secondary/10 hover:bg-secondary/20",
      },

      {
        variant: "soft",
        color: "neutral",
        className: "border-neutral/60 bg-neutral/10 hover:bg-neutral/20",
      },
      {
        variant: "soft",
        color: "info",
        className: "border-info/60 bg-info/10 hover:bg-info/20",
      },
      {
        variant: "soft",
        color: "emphasis",
        className: "border-emphasis/60 bg-emphasis/10 hover:bg-emphasis/20",
      },
      {
        variant: "soft",
        color: "accent",
        className: "border-accent/60 bg-accent/10 hover:bg-accent/20",
      },
      {
        variant: "soft",
        color: "error",
        className: "border-error/60 bg-error/10 hover:bg-error/20",
      },
      {
        variant: "soft",
        color: "success",
        className: "border-success/60 bg-success/10 hover:bg-success/20",
      },
      {
        variant: "soft",
        color: "warning",
        className: "border-warning/60 bg-warning/10 hover:bg-warning/20",
      },
      {
        variant: "outline",
        color: "primary",
        className: "border-primary",
      },
      {
        variant: "outline",
        color: "secondary",
        className: "border-secondary",
      },

      {
        variant: "outline",
        color: "neutral",
        className: "border-neutral",
      },
      {
        variant: "outline",
        color: "info",
        className: "border-info",
      },
      {
        variant: "outline",
        color: "emphasis",
        className: "border-emphasis",
      },
      {
        variant: "outline",
        color: "accent",
        className: "border-accent",
      },
      {
        variant: "outline",
        color: "error",
        className: "border-error",
      },
      {
        variant: "outline",
        color: "success",
        className: "border-success",
      },
      {
        variant: "outline",
        color: "warning",
        className: "border-warning",
      },
      {
        variant: "flat",
        color: "accent",
        className: "bg-accent",
      },
      {
        variant: "flat",
        color: "emphasis",
        className: "bg-emphasis",
      },
      {
        variant: "flat",
        color: "primary",
        className: "bg-primary",
      },
      {
        variant: "flat",
        color: "secondary",
        className: "bg-secondary",
      },
      {
        variant: "flat",
        color: "error",
        className: "bg-error",
      },
      {
        variant: "flat",
        color: "info",
        className: "bg-info",
      },
      {
        variant: "flat",
        color: "warning",
        className: "bg-warning",
      },
      {
        variant: "flat",
        color: "success",
        className: "bg-success",
      },
      {
        variant: "flat",
        color: "accent",
        className: "bg-accent",
      },
    ],
  },
);

const contentVariants = cva("flex h-full items-center gap-2 text-background", {
  variants: {
    variant: {
      primary: "text-background",
      default: "text-background",
      soft: "text-primary",
      outline: "font-semibold text-primary",
      ghost:
        "text-primary-rich underline transition-colors duration-300 hover:text-foreground-rich",
      flat: "text-background-rich",
    },
    color: {
      primary: "text-white",
      secondary: "text-white",
      emphasis: "text-accent",
      accent: "text-emphasis",
      neutral: "text-white",
      error: "text-error-foreground",
      success: "text-success-foreground",
      warning: "text-warning-foreground",
      info: "text-info-foreground",
    },
  },
  compoundVariants: [
    {
      variant: ["primary", "default"],
      className: "text-white",
    },
    {
      variant: ["primary", "default"],
      color: "emphasis",
      className: "text-background",
    },
    {
      variant: ["primary", "default"],
      color: "accent",
      className: "text-emphasis-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "primary",
      className: "text-primary-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "secondary",
      className: "text-secondary-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "emphasis",
      className: "text-emphasis-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "accent",
      className: "text-accent-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "error",
      className: "text-error-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "success",
      className: "text-success-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "warning",
      className: "text-warning-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "neutral",
      className: "text-neutral-rich",
    },
    {
      variant: ["outline", "soft", "ghost"],
      color: "info",
      className: "text-info-rich",
    },
    {
      variant: "flat",
      color: "primary",
      className: "text-primary-rich",
    },
    {
      variant: "flat",
      color: "secondary",
      className: "text-secondary-rich",
    },
    {
      variant: "flat",
      color: "emphasis",
      className: "text-accent",
    },
    {
      variant: "flat",
      color: "accent",
      className: "text-accent-rich",
    },
    {
      variant: "flat",
      color: "error",
      className: "text-error-rich",
    },
    {
      variant: "flat",
      color: "success",
      className: "text-success-rich",
    },
    {
      variant: "flat",
      color: "warning",
      className: "text-warning-rich",
    },
    {
      variant: "flat",
      color: "neutral",
      className: "text-neutral-rich",
    },
    {
      variant: "flat",
      color: "info",
      className: "text-info-rich",
    },
  ],
});

type ButtonClassListKey = "root" | "content";
export type ButtonProps = {
  asChild?: boolean;
  classList?: ClassList<ButtonClassListKey>;
} & ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export const Button = ({
  children,
  variant = "default",
  size,
  asChild,
  className,
  classList,
  disabled,
  ref,
  color = "emphasis",
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(
        buttonVariants({ variant, size, disabled, color }),
        className,
        classList?.root,
      )}
      disabled={disabled}
      {...props}
    >
      <span
        className={cn(contentVariants({ variant, color }), classList?.content)}
      >
        {children}
      </span>
    </Component>
  );
};
