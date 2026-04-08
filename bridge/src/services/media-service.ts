import { logger } from "../lib/logger";
import { Buffer } from "buffer";

export class MediaService {
  /**
   * Baixa a mídia do Baileys e joga no Supabase Storage
   * Retorna a URL pública.
   */
  static async uploadMedia(buffer: Buffer, mimeType: string, extension: string): Promise<string> {
    logger.info('Upload_media não implementado 100% no mock inicial');
    // Em produção real:
    // await supabaseAdmin.storage.from('whatsapp-media').upload(`file.${extension}`, buffer, { contentType: mimeType })
    return `https://dummy/media.${extension}`;
  }
}
