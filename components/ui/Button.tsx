"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import { useReducedMotion } from "@/lib/animations/useReducedMotion";
import { cn } from "@/lib/utils";

export type ButtonVariant = "outline-gold" | "solid-forest" | "text-link";

interface CommonButtonProps {
  children: ReactNode;
  className?: string;
  magnetic?: boolean;
  variant?: ButtonVariant;
}

type AnchorButtonProps = CommonButtonProps &
  Omit<HTMLMotionProps<"a">, "children" | "className"> & {
    href: string;
  };

type NativeButtonProps = CommonButtonProps &
  Omit<HTMLMotionProps<"button">, "children" | "className"> & {
    href?: never;
  };

export type ButtonProps = AnchorButtonProps | NativeButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  "outline-gold":
    "border border-gold text-charcoal before:bg-gold hover:text-cream",
  "solid-forest":
    "border border-forest bg-forest text-cream before:bg-gold hover:border-gold",
  "text-link":
    "min-h-0 border-b border-gold/60 px-0 py-1 text-charcoal before:hidden hover:border-gold",
};

const baseClasses =
  "group relative isolate inline-flex min-h-12 items-center justify-center overflow-hidden rounded-editorial px-6 font-body text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300 before:absolute before:inset-0 before:-z-10 before:translate-y-full before:transition-transform before:duration-500 before:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:before:translate-y-0";

export function Button(props: ButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const { children, className, magnetic, variant = "outline-gold" } = props;
  const motionProps = shouldReduceMotion ? {} : { whileTap: { scale: 0.98 } };
  const classes = cn(baseClasses, variantClasses[variant], className);

  if ("href" in props && props.href) {
    const anchor = props as AnchorButtonProps;
    const { href, target, rel, onClick, ...anchorProps } = anchor;
    delete anchorProps.magnetic;
    delete anchorProps.variant;
    delete anchorProps.className;

    return (
      <motion.a
        className={classes}
        data-magnetic={magnetic || undefined}
        href={href}
        onClick={onClick}
        rel={rel}
        target={target}
        {...motionProps}
        {...anchorProps}
      >
        {children}
      </motion.a>
    );
  }

  const native = props as NativeButtonProps;
  const { onClick, type = "button", ...buttonProps } = native;
  delete buttonProps.magnetic;
  delete buttonProps.variant;
  delete buttonProps.className;

  return (
    <motion.button
      className={classes}
      data-magnetic={magnetic || undefined}
      onClick={onClick}
      type={type}
      {...motionProps}
      {...buttonProps}
    >
      {children}
    </motion.button>
  );
}
