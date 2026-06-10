/**
 * AtelierVideos — vraies vidéos de production HM Global (atelier + chantier).
 * Preuve que l'agence existe et produit réellement en France : pose d'enseigne,
 * presse à chaud, lettrage vinyle, flocage client.
 *
 * Performance : preload="none" + poster → rien n'est téléchargé tant que le
 * visiteur ne lance pas la lecture. Pas d'autoplay sonore.
 */

const VIDEOS = [
  {
    id: "pose-enseigne",
    title: "Pose d'enseigne — Crusty Coq",
    caption: "Installation d'une enseigne lumineuse en façade, réalisée par nos soins.",
  },
  {
    id: "fixation-enseigne",
    title: "Fixation du support d'enseigne",
    caption: "Préparation et fixation du support en façade, sur le chantier Crusty Coq.",
  },
  {
    id: "presse-marquage",
    title: "Marquage à la presse",
    caption: "Pressage à chaud d'un sweat à l'atelier de Souffelweyersheim.",
  },
  {
    id: "flocage-prestige",
    title: "Marquage DTF client",
    caption: "Marquage des t-shirts Prestige Vins & Boissons.",
  },
  {
    id: "decoupe-traceur",
    title: "Découpe vinyle au traceur",
    caption: "Le traceur découpe un lettrage adhésif à l'atelier.",
  },
  {
    id: "lettrage-vinyle",
    title: "Lettrage adhésif",
    caption: "Échenillage d'un lettrage vinyle découpé à l'atelier.",
  },
] as const;

export default function AtelierVideos() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {VIDEOS.map((v) => (
        <figure
          key={v.id}
          className="overflow-hidden rounded-[1.5rem] border border-[var(--hm-line)] bg-white shadow-[0_12px_30px_rgba(63,45,88,0.06)]"
        >
          <div className="relative aspect-[3/4] bg-black">
            <video
              className="h-full w-full object-cover"
              controls
              playsInline
              muted
              loop
              preload="none"
              poster={`/videos/realisations/${v.id}-poster.jpg`}
            >
              <source src={`/videos/realisations/${v.id}.mp4`} type="video/mp4" />
            </video>
          </div>
          <figcaption className="p-4">
            <p className="text-[14px] font-semibold leading-tight text-[var(--hm-text)]">{v.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--hm-text-muted)]">{v.caption}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
