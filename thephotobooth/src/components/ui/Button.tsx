// ============================================================
// UI — Button
// Botón reutilizable con variantes "primary" y "secondary".
// Sigue el principio de componente de presentación puro.
// ============================================================

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  children,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "font-silkscreen uppercase tracking-widest text-sm transition-all duration-100 cursor-pointer select-none border-2";

  const variants = {
    primary:
      "bg-brand-pink text-white border-brand-black shadow-[4px_4px_0_#000] " +
      "hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] " +
      "active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
    secondary:
      "bg-white text-brand-black border-brand-black shadow-[4px_4px_0_#000] " +
      "hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] " +
      "active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
    ghost:
      "bg-transparent text-brand-pink border-brand-pink " +
      "hover:bg-brand-pink hover:text-white",
  };

  return (
    <button
      className={`${base} ${variants[variant]} px-6 py-3 ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
