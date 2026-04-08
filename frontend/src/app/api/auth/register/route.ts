import { NextResponse } from 'next/server';
import { registerUserWithPassword } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const user = await registerUserWithPassword({
      email,
      password,
      name,
    });

    return NextResponse.json({
      success: true,
      userId: user?.id,
    });
  } catch (error: any) {
    const message = error?.message || 'Não foi possível criar a conta.';
    const status =
      /already|registered|exists|duplicate/i.test(message) ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
