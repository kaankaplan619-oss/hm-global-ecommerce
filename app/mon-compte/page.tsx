"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Package,
  FileText,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getInitials } from "@/lib/utils";

const ACCOUNT_LINKS = [
  {
    href: "/mon-compte/commandes",
    icon: Package,
    title: "Mes commandes",
    description: "Suivez l'état de vos commandes en cours et passées",
  },
  {
    href: "/mon-compte/factures",
    icon: FileText,
    title: "Mes factures",
    description: "Téléchargez vos factures et justificatifs",
  },
  {
    href: "/mon-compte/adresses",
    icon: MapPin,
    title: "Mes adresses",
    description: "Gérez vos adresses de facturation et livraison",
  },
  {
    href: "/mon-compte/parametres",
    icon: Settings,
    title: "Paramètres",
    description: "Modifiez vos informations personnelles",
  },
];

export default function MonComptePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/connexion");
  }, [isAuthenticated, router]);

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-3xl">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-10 p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl">
          <div className="w-14 h-14 rounded-full bg-[#c9a96e22] border border-[#c9a96e44] flex items-center justify-center text-lg font-black text-[#c9a96e]">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-[#f5f5f5]">
              Bonjour, {user.firstName} !
            </h1>
            <p className="text-sm text-[#555555]">{user.email}</p>
            {user.type === "entreprise" && user.company && (
              <span className="badge badge-gold mt-1">{user.company}</span>
            )}
          </div>
          <Link href="/catalogue" className="btn-primary hidden sm:flex gap-2 text-xs">
            <ShoppingBag size={14} />
            Commander
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Commandes", value: "—" },
            { label: "En cours", value: "—" },
            { label: "Terminées", value: "—" },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 bg-[#111111] border border-[#1e1e1e] rounded-lg text-center">
              <div className="text-2xl font-black text-[#c9a96e]">{value}</div>
              <div className="text-[10px] text-[#555555] uppercase tracking-wider font-semibold mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          {ACCOUNT_LINKS.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl hover:border-[#2a2a2a] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0 group-hover:bg-[#c9a96e11] transition-colors">
                <Icon size={18} className="text-[#555555] group-hover:text-[#c9a96e] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f5f5f5]">{title}</p>
                <p className="text-xs text-[#555555]">{description}</p>
              </div>
              <ChevronRight size={14} className="text-[#555555] shrink-0" />
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-4 p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl hover:border-[#f8717133] transition-colors group text-left w-full"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-[#555555] group-hover:text-[#f87171] transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#555555] group-hover:text-[#f87171] transition-colors">
                Se déconnecter
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
