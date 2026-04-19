"use client";

/**
 * QuoteAssistant — Widget d'orientation flottant
 *
 * Masqué sur /checkout et /checkout/paiement.
 * z-index volontairement à 40 pour passer sous le CartDrawer (z-50).
 * Aucun appel API, aucun état global, aucune dépendance backend.
 */

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  X,
  ChevronLeft,
  ArrowRight,
  Shirt,
  Gift,
  HelpCircle,
  CheckCircle,
  Pencil,
  ImageOff,
  Users,
  User,
  Building2,
  Layers,
  Phone,
  BookOpen,
} from "lucide-react";

// ─── Routes masquées ──────────────────────────────────────────────────────────

const HIDDEN_PATHS = ["/checkout", "/checkout/paiement"];

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectType = "textile" | "objet" | "unknown";
type LogoStatus  = "ready" | "adapt" | "none";
type Quantity    = "micro" | "small" | "medium" | "large";

interface Answers {
  projectType?: ProjectType;
  logoStatus?:  LogoStatus;
  quantity?:    Quantity;
}

type Step = "welcome" | "project" | "logo" | "quantity" | "result";

interface ResultCTA {
  icon:        React.ReactNode;
  label:       string;
  description: string;
  href:        string;
  primary?:    boolean;
}

// ─── Logique de résultat ──────────────────────────────────────────────────────

function buildResult(answers: Answers): ResultCTA[] {
  const { projectType, logoStatus, quantity } = answers;

  // Petite série → contact en priorité
  if (quantity === "micro") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       "Nous contacter",
        description: "Les petites séries (< 10 pièces) font l'objet d'un devis personnalisé.",
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       "Voir le catalogue",
        description: "Repérez vos produits avant de nous envoyer votre demande.",
        href:        "/catalogue",
      },
    ];
  }

  // Objet pub / goodies
  if (projectType === "objet") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       "Demander un devis",
        description: "Les objets publicitaires sont traités sur devis selon vos spécifications.",
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       "Voir le catalogue textile",
        description: "Découvrez aussi nos vêtements personnalisables.",
        href:        "/catalogue",
      },
    ];
  }

  // Pas encore décidé
  if (projectType === "unknown") {
    return [
      {
        icon:        <Layers size={16} />,
        label:       "Explorer le catalogue",
        description: "T-shirts, hoodies, polos, softshells — trouvez votre produit.",
        href:        "/catalogue",
        primary:     true,
      },
      {
        icon:        <Phone size={16} />,
        label:       "Nous parler",
        description: "Un conseiller répond à vos questions sans engagement.",
        href:        "/contact",
      },
    ];
  }

  // Textile — grand volume → devis dédié
  if (quantity === "large") {
    return [
      {
        icon:        <Building2 size={16} />,
        label:       "Devis grand volume",
        description: "Pour 200 pièces et plus, nous préparons une offre tarifaire dédiée.",
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       "Voir le catalogue",
        description: "Repérez vos produits avant de nous envoyer votre devis.",
        href:        "/catalogue",
      },
    ];
  }

  // Textile — logo prêt + quantité correcte → catalogue direct
  if (logoStatus === "ready" && (quantity === "small" || quantity === "medium")) {
    return [
      {
        icon:        <Layers size={16} />,
        label:       "Configurer ma commande",
        description: "Logo prêt, quantité suffisante — lancez votre commande en quelques clics.",
        href:        "/catalogue",
        primary:     true,
      },
      {
        icon:        <Phone size={16} />,
        label:       "Une question ?",
        description: "Notre équipe reste disponible avant votre commande.",
        href:        "/contact",
      },
    ];
  }

  // Textile — logo à adapter
  if (logoStatus === "adapt") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       "Envoyer votre logo",
        description: "Envoyez-nous votre fichier, nos équipes l'adaptent gratuitement.",
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       "Parcourir le catalogue",
        description: "Repérez vos produits en attendant de préparer votre fichier.",
        href:        "/catalogue",
      },
    ];
  }

  // Textile — pas de logo
  if (logoStatus === "none") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       "Nous contacter",
        description: "Nous pouvons vous aider à préparer un logo pour la personnalisation.",
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       "Voir les produits",
        description: "Repérez vos articles en attendant de finaliser votre visuel.",
        href:        "/catalogue",
      },
    ];
  }

  // Fallback
  return [
    {
      icon:        <Layers size={16} />,
      label:       "Explorer le catalogue",
      description: "Découvrez nos produits personnalisables.",
      href:        "/catalogue",
      primary:     true,
    },
    {
      icon:        <Phone size={16} />,
      label:       "Nous contacter",
      description: "Un conseiller vous accompagne.",
      href:        "/contact",
    },
  ];
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function QuoteAssistant() {
  const pathname = usePathname();

  // Masqué sur le tunnel de commande
  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return <QuoteAssistantWidget />;
}

// Widget séparé pour éviter d'initialiser le state sur les pages masquées
function QuoteAssistantWidget() {
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState<Step>("welcome");
  const [answers, setAnswers] = useState<Answers>({});

  // ── Navigation ──
  function reset() {
    setStep("welcome");
    setAnswers({});
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  function back() {
    if (step === "project")  { reset(); return; }
    if (step === "logo")     { setStep("project"); return; }
    if (step === "quantity") { setStep(answers.projectType === "textile" ? "logo" : "project"); return; }
    if (step === "result")   { setStep("quantity"); return; }
  }

  function selectProject(v: ProjectType) {
    const updated = { ...answers, projectType: v };
    setAnswers(updated);
    setStep(v === "textile" ? "logo" : "quantity");
  }

  function selectLogo(v: LogoStatus) {
    setAnswers({ ...answers, logoStatus: v });
    setStep("quantity");
  }

  function selectQuantity(v: Quantity) {
    setAnswers({ ...answers, quantity: v });
    setStep("result");
  }

  // ── Sous-composants ──
  const StepLabel = ({ label }: { label: string }) => (
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#b13f74] mb-2">
      {label}
    </p>
  );

  const Option = ({
    icon,
    label,
    sub,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    sub?: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-[#e6e8ee] hover:border-[#b13f74] hover:bg-[#f9edf3] transition-all group"
    >
      <span className="mt-0.5 text-[#8a8198] group-hover:text-[#b13f74] transition-colors shrink-0">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#3f2d58] leading-tight">
          {label}
        </span>
        {sub && (
          <span className="block text-[11px] text-[#8a8198] mt-0.5 leading-snug">
            {sub}
          </span>
        )}
      </span>
    </button>
  );

  // ── Contenu par étape ──
  const renderStep = () => {
    switch (step) {

      case "welcome":
        return (
          <div className="flex flex-col items-center text-center gap-4 py-1">
            <div className="w-12 h-12 rounded-full bg-[#f9edf3] flex items-center justify-center">
              <MessageCircle size={22} className="text-[#b13f74]" />
            </div>
            <div>
              <p className="font-bold text-[#3f2d58] text-[15px]">
                Besoin d&rsquo;aide pour votre projet ?
              </p>
              <p className="text-[13px] text-[#6e6280] mt-1 leading-relaxed">
                3 questions rapides et je vous oriente vers la bonne solution.
              </p>
            </div>
            <button
              onClick={() => setStep("project")}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#b13f74] hover:bg-[#973761] text-white text-sm font-bold rounded-xl transition-colors"
            >
              Démarrer <ArrowRight size={14} />
            </button>
            <p className="text-[11px] text-[#8a8198]">
              Moins de 30 secondes · Aucun engagement
            </p>
          </div>
        );

      case "project":
        return (
          <div className="flex flex-col gap-2">
            <StepLabel label="Étape 1 / 3" />
            <p className="text-sm font-bold text-[#3f2d58] mb-2">
              Quel type de projet ?
            </p>
            <Option
              icon={<Shirt size={16} />}
              label="Textile"
              sub="T-shirts, hoodies, polos, vestes..."
              onClick={() => selectProject("textile")}
            />
            <Option
              icon={<Gift size={16} />}
              label="Objet publicitaire / goodies"
              sub="Mugs, stylos, sacs, accessoires..."
              onClick={() => selectProject("objet")}
            />
            <Option
              icon={<HelpCircle size={16} />}
              label="Je ne sais pas encore"
              sub="Montrez-moi ce qui existe"
              onClick={() => selectProject("unknown")}
            />
          </div>
        );

      case "logo":
        return (
          <div className="flex flex-col gap-2">
            <StepLabel label="Étape 2 / 3" />
            <p className="text-sm font-bold text-[#3f2d58] mb-2">
              Vous avez déjà votre logo ?
            </p>
            <Option
              icon={<CheckCircle size={16} />}
              label="Oui, prêt en haute résolution"
              sub="PDF, SVG, PNG HD ou fichier .AI"
              onClick={() => selectLogo("ready")}
            />
            <Option
              icon={<Pencil size={16} />}
              label="Oui, mais à adapter"
              sub="Basse résolution, mauvais format..."
              onClick={() => selectLogo("adapt")}
            />
            <Option
              icon={<ImageOff size={16} />}
              label="Pas encore de logo"
              sub="Je pars de zéro"
              onClick={() => selectLogo("none")}
            />
          </div>
        );

      case "quantity":
        return (
          <div className="flex flex-col gap-2">
            <StepLabel
              label={answers.projectType === "textile" ? "Étape 3 / 3" : "Étape 2 / 2"}
            />
            <p className="text-sm font-bold text-[#3f2d58] mb-2">
              Quantité approximative ?
            </p>
            <Option
              icon={<User size={16} />}
              label="Moins de 10 pièces"
              sub="Petite série ou test"
              onClick={() => selectQuantity("micro")}
            />
            <Option
              icon={<Users size={16} />}
              label="10 à 50 pièces"
              sub="Équipe, club, événement"
              onClick={() => selectQuantity("small")}
            />
            <Option
              icon={<Users size={16} />}
              label="50 à 200 pièces"
              sub="PME, association, franchise"
              onClick={() => selectQuantity("medium")}
            />
            <Option
              icon={<Building2 size={16} />}
              label="200 pièces et plus"
              sub="Grand volume, tarif dégressif"
              onClick={() => selectQuantity("large")}
            />
          </div>
        );

      case "result": {
        const ctas = buildResult(answers);
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-[#f9edf3] flex items-center justify-center shrink-0">
                <CheckCircle size={12} className="text-[#b13f74]" />
              </div>
              <p className="text-sm font-bold text-[#3f2d58]">
                Voilà ce que je vous recommande
              </p>
            </div>

            {ctas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                onClick={close}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  cta.primary
                    ? "border-[#b13f74] bg-[#f9edf3] hover:bg-[#f2e0eb]"
                    : "border-[#e6e8ee] hover:border-[#b13f74] hover:bg-[#f9edf3]"
                }`}
              >
                <span
                  className={`mt-0.5 shrink-0 ${
                    cta.primary ? "text-[#b13f74]" : "text-[#8a8198]"
                  }`}
                >
                  {cta.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-sm font-semibold leading-tight ${
                      cta.primary ? "text-[#b13f74]" : "text-[#3f2d58]"
                    }`}
                  >
                    {cta.label}
                  </span>
                  <span className="block text-[11px] text-[#8a8198] mt-0.5 leading-snug">
                    {cta.description}
                  </span>
                </span>
                <ArrowRight
                  size={13}
                  className="mt-1 shrink-0 text-[#8a8198]"
                />
              </Link>
            ))}

            <button
              onClick={reset}
              className="text-[11px] text-[#8a8198] hover:text-[#b13f74] transition-colors mt-1 text-center"
            >
              ← Recommencer
            </button>
          </div>
        );
      }
    }
  };

  const showBackButton = step !== "welcome" && step !== "result";
  const totalSteps     = answers.projectType === "textile" ? 3 : 2;
  const currentStep    =
    step === "project" ? 1
    : step === "logo"     ? 2
    : step === "quantity" ? (answers.projectType === "textile" ? 3 : 2)
    : 0;

  return (
    <>
      {/* ── Panneau ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assistant de devis HM Global"
        aria-hidden={!open}
        className={`
          fixed bottom-20 right-4 sm:bottom-[88px] sm:right-6
          z-40
          w-[min(320px,calc(100vw-32px))]
          transition-all duration-200 ease-out
          ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
          }
        `}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-[#e6e8ee] overflow-hidden">

          {/* En-tête */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9fb] border-b border-[#e6e8ee]">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <button
                  onClick={back}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#e6e8ee] transition-colors text-[#6e6280]"
                  aria-label="Étape précédente"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              <span className="text-xs font-bold text-[#3f2d58] tracking-wide">
                Assistant HM Global
              </span>
            </div>

            {/* Indicateur de progression */}
            {currentStep > 0 && (
              <div className="flex items-center gap-1 mr-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all ${
                      i < currentStep
                        ? "w-4 bg-[#b13f74]"
                        : "w-1.5 bg-[#e6e8ee]"
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={close}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#e6e8ee] transition-colors text-[#6e6280]"
              aria-label="Fermer l'assistant"
            >
              <X size={14} />
            </button>
          </div>

          {/* Corps */}
          <div className="p-4">{renderStep()}</div>
        </div>
      </div>

      {/* ── Bouton flottant ──
          z-40 → passe naturellement sous le CartDrawer (z-50)
          quand le tiroir panier est ouvert                      */}
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) reset();
        }}
        className={`
          fixed bottom-4 right-4 sm:bottom-6 sm:right-6
          z-40
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200
          ${open
            ? "bg-[#3f2d58] hover:bg-[#2d1f45]"
            : "bg-[#b13f74] hover:bg-[#973761]"
          }
        `}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant de devis"}
        aria-expanded={open}
      >
        {open
          ? <X size={20} className="text-white" />
          : <MessageCircle size={20} className="text-white" />
        }
      </button>
    </>
  );
}
