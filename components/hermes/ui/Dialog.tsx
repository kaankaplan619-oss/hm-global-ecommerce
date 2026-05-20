"use client";

/**
 * components/hermes/ui/Dialog.tsx — Modal centrée Hermès OS.
 *
 * Pour les confirmations Valider/Refuser/Supprimer, formulaires courts, etc.
 * Voir ConfirmDialog.tsx pour un wrapper "yes/no" prêt à l'emploi.
 */

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog        = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose   = DialogPrimitive.Close;
export const DialogPortal  = DialogPrimitive.Portal;

export function DialogContent({
  children,
  className,
  hideClose = false,
}: {
  children:   React.ReactNode;
  className?: string;
  hideClose?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
        style={{ background: "rgba(0,0,0,0.65)" }}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl outline-none p-6",
          className,
        )}
        style={{
          background:  "rgba(20,22,32,0.98)",
          border:      "1px solid rgba(255,255,255,0.10)",
          color:       "#e8e6f0",
          boxShadow:   "0 32px 64px rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
        }}
      >
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute top-3 right-3 p-1.5 rounded-md transition opacity-60 hover:opacity-100"
            aria-label="Fermer"
          >
            <X size={16} />
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogTitle({
  children,
  className,
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Title
      className={cn("text-[16px] font-semibold text-white leading-snug", className)}
    >
      {children}
    </DialogPrimitive.Title>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Description
      className={cn("text-[13px] text-white/60 leading-6 mt-2", className)}
    >
      {children}
    </DialogPrimitive.Description>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children:   React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2", className)}>
      {children}
    </div>
  );
}
