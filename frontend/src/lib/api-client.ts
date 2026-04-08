import { getSupabaseClient, hasSupabaseConfig } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function getAuthHeaders() {
  if (!hasSupabaseConfig()) {
    return {} as Record<string, string>;
  }

  const { data } = await getSupabaseClient().auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    return {} as Record<string, string>;
  }

  return {
    Authorization: `Bearer ${token}`,
  } satisfies Record<string, string>;
}

export const apiClient = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: await getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Erro na requisição (${res.status})`);
    }

    return res.json();
  },
  post: async (endpoint: string, body: unknown) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Erro na requisição (${res.status})`);
    }

    return res.json();
  },
};
