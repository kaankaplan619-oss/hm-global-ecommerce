import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * BackLink — bouton « retour » unifié pour tout le site.
 *
 * Source de vérité unique : avant, chaque section avait son propre retour
 * (compte = pilule, print/contact/pages info = fil d'Ariane minuscule en
 * text-xs, textile = chips). L'utilisateur se perdait. Ici, un seul style
 * (la pilule validée de "Retour sur mon compte"), avec un libellé contextuel.
 *
 * Libellés conseillés : "Retour à l'accueil", "Retour au print",
 * "Retour au catalogue", "Retour sur mon compte", "Retour aux commandes"…
 *
 * @param href      destination du retour
 * @param label     texte affiché (toujours préfixé "Retour …")
 * @param className marges/contexte (défaut: mb-8)
 */
export default function BackLink({
  href,
  label,
  className = "mb-8",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border border-[#e6e8ee] bg-white px-4 py-2 text-sm font-semibold text-[#3f2d58] shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-colors hover:border-[#c4c0cf] hover:text-[#7B4FA6] ${className}`}
    >
      <ChevronLeft size={16} className="shrink-0" />
      {label}
    </Link>
  );
}
