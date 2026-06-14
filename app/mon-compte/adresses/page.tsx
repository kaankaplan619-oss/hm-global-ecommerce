"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Plus, ChevronLeft, CheckCircle2, AlertCircle, Loader2, X, Pencil,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import AddressAutocomplete from "@/components/checkout/AddressAutocomplete";
import { useT } from "@/components/i18n/I18nProvider";

// ── Gradient signature HM Global ──────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

type AddressType = "facturation" | "livraison";

interface AddressForm {
  firstName: string;
  lastName: string;
  company: string;
  street: string;
  complement: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

const EMPTY_FORM: AddressForm = {
  firstName: "", lastName: "", company: "", street: "", complement: "",
  postalCode: "", city: "", country: "France", phone: "",
};

function AddressCard({
  type,
  address,
  onEdit,
}: {
  type: AddressType;
  address: AddressForm | null;
  onEdit: () => void;
}) {
  const t = useT();
  const cardTitle = type === "facturation"
    ? t("accountAddresses.card.billingTitle")
    : t("accountAddresses.card.shippingTitle");
  const emptyText = type === "facturation"
    ? t("accountAddresses.card.billingEmpty")
    : t("accountAddresses.card.shippingEmpty");
  const accent = type === "facturation" ? "#7B4FA6" : "#5BC4D8";
  const bg     = type === "facturation" ? "#f3eefb" : "#edf9fc";
  const border = type === "facturation" ? "#7B4FA644" : "#5BC4D844";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-[#e6e8ee] px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border"
            style={{ backgroundColor: bg, borderColor: border }}
          >
            <MapPin size={14} style={{ color: accent }} />
          </div>
          <span className="text-sm font-bold text-[#3f2d58]">{cardTitle}</span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#7B4FA6] transition-colors hover:bg-[#f3eefb]"
        >
          <Pencil size={11} />
          {address ? t("accountAddresses.card.edit") : t("accountAddresses.card.add")}
        </button>
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        {address ? (
          <address className="not-italic text-sm leading-7 text-[#3f2d58]">
            <span className="font-semibold">{address.firstName} {address.lastName}</span>
            {address.company && <><br />{address.company}</>}
            <br />{address.street}
            {address.complement && <><br />{address.complement}</>}
            <br />{address.postalCode} {address.city}
            <br />{address.country}
            {address.phone && <><br /><span className="text-[#6e6280]">{address.phone}</span></>}
          </address>
        ) : (
          <p className="py-2 text-sm text-[#a09bb0]">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdressesPage() {
  const t = useT();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [billing, setBilling]   = useState<AddressForm | null>(null);
  const [shipping, setShipping] = useState<AddressForm | null>(null);

  // Which modal is open: null | "facturation" | "livraison"
  const [editType, setEditType]   = useState<AddressType | null>(null);
  const [editForm, setEditForm]   = useState<AddressForm>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError]   = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push("/connexion"); return; }

    // Fetch most recent order to pre-fill addresses
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        const orders = data.orders ?? [];
        if (orders.length > 0) {
          const latest = orders[0];
          // Raw billing/shipping from DB are plain objects
          const rawBilling  = latest.billing_address  ?? latest.billingAddress;
          const rawShipping = latest.shipping_address ?? latest.shippingAddress;
          if (rawBilling) {
            setBilling({
              firstName:  rawBilling.firstName  ?? "",
              lastName:   rawBilling.lastName   ?? "",
              company:    rawBilling.company    ?? "",
              street:     rawBilling.street     ?? rawBilling.address ?? "",
              complement: rawBilling.complement ?? "",
              postalCode: rawBilling.postalCode ?? rawBilling.zipCode ?? "",
              city:       rawBilling.city       ?? "",
              country:    rawBilling.country    ?? "France",
              phone:      rawBilling.phone      ?? "",
            });
          }
          if (rawShipping) {
            setShipping({
              firstName:  rawShipping.firstName  ?? "",
              lastName:   rawShipping.lastName   ?? "",
              company:    rawShipping.company    ?? "",
              street:     rawShipping.street     ?? rawShipping.address ?? "",
              complement: rawShipping.complement ?? "",
              postalCode: rawShipping.postalCode ?? rawShipping.zipCode ?? "",
              city:       rawShipping.city       ?? "",
              country:    rawShipping.country    ?? "France",
              phone:      rawShipping.phone      ?? "",
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [_hasHydrated, isAuthenticated, router]);

  const openEdit = (type: AddressType) => {
    setEditType(type);
    setEditForm(type === "facturation" ? (billing ?? EMPTY_FORM) : (shipping ?? EMPTY_FORM));
    setSaveSuccess(false);
    setSaveError("");
  };

  const closeEdit = () => { setEditType(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(""); setSaveSuccess(false); setSaving(true);
    try {
      // Persist locally (no dedicated API yet — addresses come from orders)
      if (editType === "facturation") setBilling(editForm);
      else setShipping(editForm);
      setSaveSuccess(true);
      setTimeout(() => { closeEdit(); setSaveSuccess(false); }, 900);
    } catch {
      setSaveError(t("accountAddresses.modal.genericError"));
    } finally {
      setSaving(false);
    }
  };

  if (!_hasHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
      <div className="container max-w-3xl">

        {/* Bouton retour */}
        <Link
          href="/mon-compte"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e6e8ee] bg-white px-4 py-2 text-sm font-semibold text-[#3f2d58] shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-colors hover:border-[#c4c0cf] hover:text-[#7B4FA6]"
        >
          <ChevronLeft size={16} />
          {t("accountAddresses.backToAccount")}
        </Link>

        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_8px_24px_rgba(63,45,88,0.06)]">
          <div className="h-2 w-full" style={{ background: HM_GRADIENT }} />
          <div className="flex items-center gap-4 p-6">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #edf9fc, #f3eefb)" }}
            >
              <MapPin size={20} style={{ color: "#7B4FA6" }} />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#3f2d58]">{t("accountAddresses.title")}</h1>
              <p className="text-sm text-[#6e6280]">
                {t("accountAddresses.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6e6280]">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <AddressCard type="facturation" address={billing}  onEdit={() => openEdit("facturation")} />
            <AddressCard type="livraison"   address={shipping} onEdit={() => openEdit("livraison")} />

            <p className="text-center text-[11px] text-[#a09bb0]">
              {t("accountAddresses.prefillNote")}
            </p>
          </div>
        )}

      </div>

      {/* ── Modal / Drawer d'édition ───────────────────────────────────────── */}
      {editType && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#e6e8ee] px-6 py-4">
              <h2 className="text-base font-black text-[#3f2d58]">
                {editType === "facturation"
                  ? t("accountAddresses.card.billingTitle")
                  : t("accountAddresses.card.shippingTitle")}
              </h2>
              <button onClick={closeEdit} className="text-[#6e6280] hover:text-[#3f2d58] transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-[#86efac] bg-[#f0fdf4] p-3 text-sm text-[#166534]">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {t("accountAddresses.modal.saved")}
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                  <AlertCircle size={14} className="shrink-0" />
                  {saveError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t("accountAddresses.form.firstName")}</label>
                  <input type="text" className="input" required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="label">{t("accountAddresses.form.lastName")}</label>
                  <input type="text" className="input" required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t("accountAddresses.form.company")}</label>
                <input type="text" className="input"
                  value={editForm.company}
                  onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))}
                  autoComplete="organization"
                />
              </div>

              <div>
                <label className="label">{t("accountAddresses.form.address")}</label>
                <AddressAutocomplete
                  value={editForm.street}
                  onChange={(street) => setEditForm((f) => ({ ...f, street }))}
                  onSelect={({ street, postcode, city }) =>
                    setEditForm((f) => ({ ...f, street, postalCode: postcode, city }))
                  }
                  placeholder={t("accountAddresses.form.addressPlaceholder")}
                />
              </div>

              <div>
                <label className="label">{t("accountAddresses.form.complement")}</label>
                <input type="text" className="input"
                  value={editForm.complement}
                  onChange={(e) => setEditForm((f) => ({ ...f, complement: e.target.value }))}
                  placeholder={t("accountAddresses.form.complementPlaceholder")}
                  autoComplete="address-line2"
                />
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-3">
                <div>
                  <label className="label">{t("accountAddresses.form.postalCode")}</label>
                  <input type="text" className="input font-mono" required
                    value={editForm.postalCode}
                    onChange={(e) => setEditForm((f) => ({ ...f, postalCode: e.target.value }))}
                    placeholder="75001"
                    autoComplete="postal-code"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="label">{t("accountAddresses.form.city")}</label>
                  <input type="text" className="input" required
                    value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Paris"
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t("accountAddresses.form.country")}</label>
                <select
                  className="input"
                  value={editForm.country}
                  onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                >
                  {["France", "Belgique", "Suisse", "Luxembourg", "Monaco"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t("accountAddresses.form.phone")}</label>
                <input type="tel" className="input"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+33 6 12 34 56 78"
                  autoComplete="tel"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e6e8ee] pt-4">
                <button type="button" onClick={closeEdit} className="btn-ghost text-sm">
                  {t("accountAddresses.modal.cancel")}
                </button>
                <button type="submit" disabled={saving} className="btn-primary gap-2 min-w-[130px] justify-center">
                  {saving ? (
                    <><Loader2 size={13} className="animate-spin" />{t("accountAddresses.modal.saving")}</>
                  ) : (
                    <><CheckCircle2 size={13} />{t("accountAddresses.modal.save")}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
