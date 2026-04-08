import { NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  getOrCreatePrimaryInstance,
} from '@/lib/supabase-server';

const BRIDGE_URL = process.env.BRIDGE_API_URL || 'http://localhost:3001';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const instance = await getOrCreatePrimaryInstance(user);

    try {
      const response = await fetch(
        `${BRIDGE_URL}/sessions/status?instanceId=${encodeURIComponent(instance.id)}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Bridge indisponível');
      }

      const bridgeStatus = await response.json();

      return NextResponse.json({
        ...bridgeStatus,
        instanceId: instance.id,
        instanceStatus: instance.status,
      });
    } catch {
      return NextResponse.json({
        status: instance.status === 'connected' ? 'connected' : 'loading',
        instanceId: instance.id,
        instanceStatus: instance.status,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
