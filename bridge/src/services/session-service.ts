import { getSupabaseAdmin } from '../lib/supabase-admin';
import { logger } from '../lib/logger';

export class SessionService {
  static async saveSessionData(instanceId: string, creds: any, jid?: string | null) {
    const supabaseAdmin = getSupabaseAdmin();
    logger.info(`Salvando credenciais da sessao para ${instanceId}`);

    const payload: Record<string, unknown> = {
      session_data: creds,
      status: 'connected',
      last_sync_at: new Date().toISOString(),
    };

    if (jid) {
      payload.jid = jid;
    }

    const { error } = await supabaseAdmin
      .from('whatsapp_instances')
      .update(payload)
      .eq('id', instanceId);

    if (error) {
      logger.error('Erro ao salvar sessao no Supabase:', error);
    }
  }

  static async clearSession(instanceId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin
      .from('whatsapp_instances')
      .update({ session_data: null, status: 'disconnected' })
      .eq('id', instanceId);
  }
}
