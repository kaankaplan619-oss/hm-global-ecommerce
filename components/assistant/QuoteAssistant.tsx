"use client";

/**
 * QuoteAssistant — Widget d'orientation flottant
 *
 * Masqué sur les écrans transactionnels pour ne pas couvrir les formulaires.
 * z-index volontairement à 40 pour passer sous le CartDrawer (z-50).
 * Aucun appel API, aucun état global, aucune dépendance backend.
 */

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useT } from "@/components/i18n/I18nProvider";
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
} from "lucide-react";

// ─── Routes masquées ──────────────────────────────────────────────────────────

const HIDDEN_PATHS = ["/checkout", "/checkout/paiement", "/studio"];

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

function buildResult(answers: Answers, t: (key: string) => string): ResultCTA[] {
  const { projectType, logoStatus, quantity } = answers;

  // Petite série → contact en priorité
  if (quantity === "micro") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       t("quote.result.micro.contact.label"),
        description: t("quote.result.micro.contact.description"),
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       t("quote.result.micro.catalogue.label"),
        description: t("quote.result.micro.catalogue.description"),
        href:        "/catalogue",
      },
    ];
  }

  // Objet pub / goodies
  if (projectType === "objet") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       t("quote.result.objet.quote.label"),
        description: t("quote.result.objet.quote.description"),
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       t("quote.result.objet.catalogue.label"),
        description: t("quote.result.objet.catalogue.description"),
        href:        "/catalogue",
      },
    ];
  }

  // Pas encore décidé
  if (projectType === "unknown") {
    return [
      {
        icon:        <Layers size={16} />,
        label:       t("quote.result.unknown.catalogue.label"),
        description: t("quote.result.unknown.catalogue.description"),
        href:        "/catalogue",
        primary:     true,
      },
      {
        icon:        <Phone size={16} />,
        label:       t("quote.result.unknown.contact.label"),
        description: t("quote.result.unknown.contact.description"),
        href:        "/contact",
      },
    ];
  }

  // Textile — grand volume → devis dédié
  if (quantity === "large") {
    return [
      {
        icon:        <Building2 size={16} />,
        label:       t("quote.result.large.quote.label"),
        description: t("quote.result.large.quote.description"),
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       t("quote.result.large.catalogue.label"),
        description: t("quote.result.large.catalogue.description"),
        href:        "/catalogue",
      },
    ];
  }

  // Textile — logo prêt + quantité correcte → catalogue direct
  if (logoStatus === "ready" && (quantity === "small" || quantity === "medium")) {
    return [
      {
        icon:        <Layers size={16} />,
        label:       t("quote.result.ready.configure.label"),
        description: t("quote.result.ready.configure.description"),
        href:        "/catalogue",
        primary:     true,
      },
      {
        icon:        <Phone size={16} />,
        label:       t("quote.result.ready.question.label"),
        description: t("quote.result.ready.question.description"),
        href:        "/contact",
      },
    ];
  }

  // Textile — logo à adapter
  if (logoStatus === "adapt") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       t("quote.result.adapt.sendLogo.label"),
        description: t("quote.result.adapt.sendLogo.description"),
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       t("quote.result.adapt.catalogue.label"),
        description: t("quote.result.adapt.catalogue.description"),
        href:        "/catalogue",
      },
    ];
  }

  // Textile — pas de logo
  if (logoStatus === "none") {
    return [
      {
        icon:        <Phone size={16} />,
        label:       t("quote.result.none.contact.label"),
        description: t("quote.result.none.contact.description"),
        href:        "/contact",
        primary:     true,
      },
      {
        icon:        <Layers size={16} />,
        label:       t("quote.result.none.catalogue.label"),
        description: t("quote.result.none.catalogue.description"),
        href:        "/catalogue",
      },
    ];
  }

  // Fallback
  return [
    {
      icon:        <Layers size={16} />,
      label:       t("quote.result.fallback.catalogue.label"),
      description: t("quote.result.fallback.catalogue.description"),
      href:        "/catalogue",
      primary:     true,
    },
    {
      icon:        <Phone size={16} />,
      label:       t("quote.result.fallback.contact.label"),
      description: t("quote.result.fallback.contact.description"),
      href:        "/contact",
    },
  ];
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function QuoteAssistant() {
  const pathname = usePathname();
  const isPrintConfigurator = pathname.startsWith("/impression/");

  // Masqué sur les tunnels de commande et les configurateurs.
  if (
    isPrintConfigurator ||
    HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return null;
  }

  return <QuoteAssistantWidget />;
}

// Widget séparé pour éviter d'initialiser le state sur les pages masquées
function QuoteAssistantWidget() {
  const t = useT();
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
                {t("quote.welcome.title")}
              </p>
              <p className="text-[13px] text-[#6e6280] mt-1 leading-relaxed">
                {t("quote.welcome.subtitle")}
              </p>
            </div>
            <button
              onClick={() => setStep("project")}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#b13f74] hover:bg-[#973761] text-white text-sm font-bold rounded-xl transition-colors"
            >
              {t("quote.welcome.start")} <ArrowRight size={14} />
            </button>
            <p className="text-[11px] text-[#8a8198]">
              {t("quote.welcome.reassurance")}
            </p>
          </div>
        );

      case "project":
        return (
          <div className="flex flex-col gap-2">
            <StepLabel label={t("quote.project.step")} />
            <p className="text-sm font-bold text-[#3f2d58] mb-2">
              {t("quote.project.question")}
            </p>
            <Option
              icon={<Shirt size={16} />}
              label={t("quote.project.textile.label")}
              sub={t("quote.project.textile.sub")}
              onClick={() => selectProject("textile")}
            />
            <Option
              icon={<Gift size={16} />}
              label={t("quote.project.objet.label")}
              sub={t("quote.project.objet.sub")}
              onClick={() => selectProject("objet")}
            />
            <Option
              icon={<HelpCircle size={16} />}
              label={t("quote.project.unknown.label")}
              sub={t("quote.project.unknown.sub")}
              onClick={() => selectProject("unknown")}
            />
          </div>
        );

      case "logo":
        return (
          <div className="flex flex-col gap-2">
            <StepLabel label={t("quote.logo.step")} />
            <p className="text-sm font-bold text-[#3f2d58] mb-2">
              {t("quote.logo.question")}
            </p>
            <Option
              icon={<CheckCircle size={16} />}
              label={t("quote.logo.ready.label")}
              sub={t("quote.logo.ready.sub")}
              onClick={() => selectLogo("ready")}
            />
            <Option
              icon={<Pencil size={16} />}
              label={t("quote.logo.adapt.label")}
              sub={t("quote.logo.adapt.sub")}
              onClick={() => selectLogo("adapt")}
            />
            <Option
              icon={<ImageOff size={16} />}
              label={t("quote.logo.none.label")}
              sub={t("quote.logo.none.sub")}
              onClick={() => selectLogo("none")}
            />
          </div>
        );

      case "quantity":
        return (
          <div className="flex flex-col gap-2">
            <StepLabel
              label={answers.projectType === "textile" ? t("quote.quantity.step3of3") : t("quote.quantity.step2of2")}
            />
            <p className="text-sm font-bold text-[#3f2d58] mb-2">
              {t("quote.quantity.question")}
            </p>
            <Option
              icon={<User size={16} />}
              label={t("quote.quantity.micro.label")}
              sub={t("quote.quantity.micro.sub")}
              onClick={() => selectQuantity("micro")}
            />
            <Option
              icon={<Users size={16} />}
              label={t("quote.quantity.small.label")}
              sub={t("quote.quantity.small.sub")}
              onClick={() => selectQuantity("small")}
            />
            <Option
              icon={<Users size={16} />}
              label={t("quote.quantity.medium.label")}
              sub={t("quote.quantity.medium.sub")}
              onClick={() => selectQuantity("medium")}
            />
            <Option
              icon={<Building2 size={16} />}
              label={t("quote.quantity.large.label")}
              sub={t("quote.quantity.large.sub")}
              onClick={() => selectQuantity("large")}
            />
          </div>
        );

      case "result": {
        const ctas = buildResult(answers, t);
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-[#f9edf3] flex items-center justify-center shrink-0">
                <CheckCircle size={12} className="text-[#b13f74]" />
              </div>
              <p className="text-sm font-bold text-[#3f2d58]">
                {t("quote.result.heading")}
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
              {t("quote.result.restart")}
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
        aria-label={t("quote.aria.dialog")}
        aria-hidden={!open}
        className={`
          fixed bottom-20 right-4 sm:bottom-[88px] sm:right-6
          z-40
          w-[min(312px,calc(100vw-32px))]
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
                  aria-label={t("quote.aria.previousStep")}
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              <span className="text-xs font-bold text-[#3f2d58] tracking-wide">
                {t("quote.header.title")}
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
              aria-label={t("quote.aria.close")}
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
          h-[52px] w-[52px] rounded-full shadow-[0_14px_30px_rgba(177,63,116,0.28)]
          flex items-center justify-center
          transition-all duration-200
          ${open
            ? "bg-[#3f2d58] hover:bg-[#2d1f45]"
            : "bg-[#b13f74] hover:bg-[#973761]"
          }
        `}
        aria-label={open ? t("quote.aria.close") : t("quote.aria.open")}
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
