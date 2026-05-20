"use client";

/**
 * components/hermes/ui/DropdownMenu.tsx — Menu déroulant Hermès OS.
 *
 * Wrapper Radix DropdownMenu pour menus contextuels (actions sur une ligne,
 * tri, vue, etc.). Aligné dark theme.
 */

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu          = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger   = DropdownMenuPrimitive.Trigger;
export const DropdownMenuPortal    = DropdownMenuPrimitive.Portal;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export function DropdownMenuContent({
  children,
  align = "end",
  sideOffset = 6,
  className,
}: {
  children:    React.ReactNode;
  align?:      "start" | "center" | "end";
  sideOffset?: number;
  className?:  string;
}) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[180px] rounded-lg p-1 outline-none",
          className,
        )}
        style={{
          background:  "rgba(20,22,32,0.98)",
          border:      "1px solid rgba(255,255,255,0.10)",
          color:       "#e8e6f0",
          boxShadow:   "0 16px 40px rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPortal>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
  tone = "default",
}: {
  children:   React.ReactNode;
  onSelect?:  () => void;
  className?: string;
  tone?:      "default" | "danger";
}) {
  return (
    <DropdownMenuPrimitive.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] cursor-pointer outline-none transition select-none",
        "data-[highlighted]:bg-white/5",
        tone === "danger" ? "text-red-300 data-[highlighted]:text-red-200" : "text-white/85",
        className,
      )}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40",
        className,
      )}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
}
