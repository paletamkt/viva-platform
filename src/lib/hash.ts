import crypto from 'crypto';

/**
 * Gera uma impressão digital curta (hash) do conteúdo da conversa.
 * Usada para diferenciar conversas do mesmo contato/dia com conteúdo
 * diferente, evitando falsos positivos de "duplicata".
 */
export function hashConversa(conversa: string): string {
  return crypto
    .createHash('sha256')
    .update(conversa.trim())
    .digest('hex')
    .slice(0, 10);
}