import { getSupabaseAdmin } from "../lib/supabase-admin";
import { WhatsAppContact } from "../types/whatsapp";

export class ContactService {
  static async upsertContact(instanceId: string, contact: WhatsAppContact) {
    const supabaseAdmin = getSupabaseAdmin();
    if (!contact.id) return;

    const isGroup = contact.id.includes('@g.us');

    await supabaseAdmin.from('contacts').upsert({
      instance_id: instanceId,
      jid: contact.id,
      push_name: contact.notify || '',
      verified_name: contact.name || '',
      is_group: isGroup
    }, { onConflict: 'instance_id, jid' });
  }

  static async getContactByJid(instanceId: string, jid: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('instance_id', instanceId)
      .eq('jid', jid)
      .single();
    return data;
  }
}
