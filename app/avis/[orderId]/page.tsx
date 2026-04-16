"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Send, CheckCircle } from "lucide-react";

type Props = { params: Promise<{ orderId: string }> };

export default function AvisPage({ params }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    try {
      const { orderId } = await params;
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#4ade8022] border border-[#4ade8044] flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-[#4ade80]" />
          </div>
          <h1 className="text-xl font-black text-[#f5f5f5] mb-3">Merci pour votre avis !</h1>
          <p className="text-sm text-[#555555] mb-8">
            Votre retour est précieux et sera publié après modération.
          </p>
          <Link href="/catalogue" className="btn-primary">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-[#f5f5f5] font-black text-xl tracking-wider uppercase">HM GLOBAL</div>
            <div className="text-[#c9a96e] font-light text-[10px] tracking-[0.25em] uppercase">Agence</div>
          </Link>
          <h1 className="text-2xl font-black text-[#f5f5f5] mb-2">Votre avis compte</h1>
          <p className="text-sm text-[#555555]">
            Comment s&rsquo;est passée votre commande ? Partagez votre expérience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#111111] border border-[#1e1e1e] rounded-xl flex flex-col gap-5"
        >
          {/* Star rating */}
          <div>
            <label className="label">Note globale *</label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoverRating || rating)
                        ? "text-[#c9a96e] fill-[#c9a96e]"
                        : "text-[#2a2a2a]"
                    }
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-[#555555] mt-2">
                {["", "Très insatisfait", "Insatisfait", "Correct", "Satisfait", "Très satisfait"][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="label">Commentaire (optionnel)</label>
            <textarea
              className="input h-28 resize-none mt-1"
              placeholder="Qualité des produits, délais, service client..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            <p className="text-[10px] text-[#555555] mt-1 text-right">{comment.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={rating === 0 || loading}
            className="btn-primary w-full gap-2"
          >
            {loading ? "Envoi..." : (
              <>
                <Send size={14} />
                Envoyer mon avis
              </>
            )}
          </button>

          <p className="text-[10px] text-[#555555] text-center">
            Votre avis sera publié après modération par notre équipe.
          </p>
        </form>
      </div>
    </div>
  );
}
