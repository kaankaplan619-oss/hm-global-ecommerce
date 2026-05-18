/**
 * lib/discord/verify.ts — Verification de la signature Ed25519 Discord.
 *
 * Discord signe chaque interaction (slash command, PING) avec sa cle publique
 * Ed25519. On doit verifier cette signature avant de traiter la requete,
 * sinon n'importe qui pourrait envoyer des faux POST sur notre endpoint.
 *
 * Reference officielle :
 *   https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization
 *
 * Implementation zero-dependance : utilise WebCrypto natif Node >= 19 (Ed25519).
 * La cle publique Discord est donnee en hex 32 bytes (raw, pas DER).
 */

import { webcrypto } from "node:crypto";

/**
 * Convertit une chaine hexadecimale en Uint8Array.
 * Discord envoie signature + public key au format hex sans prefixe.
 */
function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = parseInt(hex.substr(i * 2, 2), 16);
    if (Number.isNaN(byte)) throw new Error("Invalid hex character");
    bytes[i] = byte;
  }
  return bytes;
}

/**
 * Verifie la signature Ed25519 d'une interaction Discord.
 *
 * @param publicKey - cle publique de l'application Discord (hex 64 chars = 32 bytes)
 * @param signature - X-Signature-Ed25519 header (hex 128 chars = 64 bytes)
 * @param timestamp - X-Signature-Timestamp header (epoch en secondes, string)
 * @param body - corps brut de la requete (string, non parse)
 * @returns true si la signature est valide
 */
export async function verifyDiscordSignature(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string,
): Promise<boolean> {
  try {
    const keyBytes = hexToUint8Array(publicKey);
    const sigBytes = hexToUint8Array(signature);
    const messageBytes = new TextEncoder().encode(timestamp + body);

    const key = await webcrypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "Ed25519" },
      false,
      ["verify"],
    );

    return await webcrypto.subtle.verify(
      "Ed25519",
      key,
      sigBytes,
      messageBytes,
    );
  } catch (err) {
    // Toute erreur (format, key import, etc.) = signature invalide.
    // Ne PAS logger les inputs (ils contiennent peut-etre des elements sensibles).
    console.error("[discord/verify] verification error:", (err as Error)?.name ?? "unknown");
    return false;
  }
}
