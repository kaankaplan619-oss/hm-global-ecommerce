"use client";

/**
 * components/hermes/ui/Sheet.tsx — Sheet (drawer latéral) Hermès OS.
 *
 * Wrapper Radix Dialog inspiré shadcn/ui mais aligné sur les tokens HM dark.
 * Pas de plugin tailwindcss-animate : on utilise les data-state attributes
 * Radix avec transitions CSS natives.
 *
 * Usage :
 *   <Sheet open={open} onOpenChange={setOpen}>
 *     <SheetContent side="left">
 *       ...
 *     </SheetContent>
 *   </Sheet>
 */

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet        = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose   = DialogPrimitive.Close;
export const SheetPortal  = DialogPrimitive.Portal;
export const SheetTitle   = DialogPrimitive.Title;

type Side = "left" | "right" | "top" | "bottom";

const SIDE_CLASSES: Record<Side, string> = {
  left:   "inset-y-0 left-0 h-full w-72 max-w-[85vw] border-r",
  right:  "inset-y-0 right-0 h-full w-72 max-w-[85vw] border-l",
  top:    "inset-x-0 top-0 h-auto max-h-[85vh] border-b",
  bottom: "inset-x-0 bottom-0 h-auto max-h-[85vh] border-t",
};

export function SheetContent({
  side = "left",
  children,
  className,
  hideClose = false,
}: {
  side?:      Side;
  children:   React.ReactNode;
  className?: string;
  hideClose?: boolean;
}) {
  return (
    <SheetPortal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
        style={{ background: "rgba(0,0,0,0.65)" }}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col outline-none transition-transform duration-250",
          SIDE_CLASSES[side],
          className,
        )}
        style={{
          background:  "#0c0e14",
          borderColor: "rgba(255,255,255,0.08)",
          color:       "#e8e6f0",
          boxShadow:   "0 24px 56px rgba(0,0,0,0.5)",
        }}
      >
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute top-3 right-3 p-2 rounded-lg transition"
            style={{ background: "rgba(255,255,255,0.05)" }}
            aria-label="Fermer"
          >
            <X size={18} />
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}
