/**
 * Layout isolé pour les pages /dev — masque Navbar, Footer et assistant du site.
 * Visible uniquement en développement local.
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body > header,
        body > footer,
        [aria-label="Assistant de devis HM Global"] { display: none !important; }
        body > main { padding-top: 0 !important; }
      `}</style>
      {children}
    </>
  );
}
