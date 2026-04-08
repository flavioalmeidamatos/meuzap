// Utilitários para assegurarmos que nunca processamos o mesmo payload 2 vezes
export const processedIds = new Set<string>();

export function isProcessed(id: string): boolean {
  if (processedIds.has(id)) return true;
  processedIds.add(id);
  // Limpa o cache periodicamente em cenário real (Redis)
  return false;
}
