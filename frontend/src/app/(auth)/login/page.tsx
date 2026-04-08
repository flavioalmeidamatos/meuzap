"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { useAuthSession } from "@/hooks/use-auth-session";

type SessionStatus = "idle" | "loading" | "pairing" | "connected";
type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { status: authStatus, user } = useAuthSession();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setSessionStatus("idle");
      setQrCode(null);
      return;
    }

    let isMounted = true;
    let pollingId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        if (isMounted) {
          setSessionStatus((current) =>
            current === "connected" ? current : "loading"
          );
        }

        const res = await apiClient.get("/sessions/status");

        if (!isMounted) {
          return;
        }

        if (res.status === "connected") {
          setSessionStatus("connected");
          setQrCode(null);
          router.replace("/");
          return;
        }

        if (res.status === "pairing" && res.qr) {
          setSessionStatus("pairing");
          setQrCode(res.qr);
          return;
        }

        setSessionStatus("loading");
      } catch (error: any) {
        if (!isMounted) {
          return;
        }

        setSessionStatus("loading");
        setInfoMessage(error.message || "Não foi possível consultar a sessão.");
      }
    };

    void checkStatus();
    pollingId = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollingId);
    };
  }, [authStatus, router]);

  const userLabel = useMemo(() => {
    if (!user) {
      return "";
    }

    return user.user_metadata?.name || user.email || "Usuário";
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    setInfoMessage(null);

    try {
      const supabase = getSupabaseClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setInfoMessage(
            "Conta criada. Se o projeto exigir confirmação, verifique seu e-mail para continuar."
          );
        } else {
          setInfoMessage("Conta criada com sucesso. Preparando seu acesso...");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      }
    } catch (error: any) {
      setAuthError(error.message || "Não foi possível autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setQrCode(null);
    setSessionStatus("idle");
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-[#0b141a] text-[#e9edef]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:items-stretch lg:gap-6 lg:px-8">
        <section className="flex flex-1 flex-col justify-between rounded-[28px] border border-[#1f2c33] bg-[radial-gradient(circle_at_top,_rgba(0,168,132,0.2),_transparent_42%),linear-gradient(180deg,_#111b21_0%,_#0b141a_100%)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-7">
          <div>
            <span className="inline-flex rounded-full border border-[#244038] bg-[#122229] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#7ad6bd]">
              MeuZap
            </span>
            <h1 className="mt-4 max-w-md text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Entre com sua conta e conecte seu WhatsApp com segurança.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#9fb0b8] sm:text-base">
              O acesso ao banco agora é protegido por autenticação. Primeiro você
              entra no MeuZap, depois faz o pareamento do número na mesma tela.
            </p>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-[#c5d1d6] sm:grid-cols-3">
            <div className="rounded-2xl border border-[#1f2c33] bg-[#111b21]/70 p-4">
              <strong className="block text-white">1. Acesse</strong>
              Use e-mail e senha para entrar na sua área.
            </div>
            <div className="rounded-2xl border border-[#1f2c33] bg-[#111b21]/70 p-4">
              <strong className="block text-white">2. Pareie</strong>
              Escaneie o QR Code do seu aparelho quando ele aparecer.
            </div>
            <div className="rounded-2xl border border-[#1f2c33] bg-[#111b21]/70 p-4">
              <strong className="block text-white">3. Converse</strong>
              Suas conversas ficam isoladas por usuário e instância.
            </div>
          </div>
        </section>

        <section className="mt-5 flex w-full flex-col gap-4 lg:mt-0 lg:max-w-[440px]">
          {authStatus !== "authenticated" ? (
            <div className="rounded-[28px] border border-[#1f2c33] bg-[#111b21] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
              <div className="flex rounded-2xl bg-[#0d171c] p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    mode === "signin"
                      ? "bg-[#00a884] text-[#06281f]"
                      : "text-[#9fb0b8]"
                  }`}
                  onClick={() => setMode("signin")}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    mode === "signup"
                      ? "bg-[#00a884] text-[#06281f]"
                      : "text-[#9fb0b8]"
                  }`}
                  onClick={() => setMode("signup")}
                >
                  Criar conta
                </button>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <label className="block">
                    <span className="mb-2 block text-sm text-[#c5d1d6]">Nome</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-[#223239] bg-[#0d171c] px-4 text-base outline-none transition focus:border-[#00a884]"
                      placeholder="Como você quer aparecer"
                      required={mode === "signup"}
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm text-[#c5d1d6]">E-mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#223239] bg-[#0d171c] px-4 text-base outline-none transition focus:border-[#00a884]"
                    placeholder="voce@empresa.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-[#c5d1d6]">Senha</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#223239] bg-[#0d171c] px-4 text-base outline-none transition focus:border-[#00a884]"
                    placeholder="Sua senha"
                    required
                    minLength={6}
                  />
                </label>

                {authError && (
                  <div className="rounded-2xl border border-[#5f2f39] bg-[#2a1218] px-4 py-3 text-sm text-[#ffb3c1]">
                    {authError}
                  </div>
                )}

                {infoMessage && (
                  <div className="rounded-2xl border border-[#23453b] bg-[#11241f] px-4 py-3 text-sm text-[#a4e5d1]">
                    {infoMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || authStatus === "loading"}
                  className="h-12 w-full rounded-2xl bg-[#00a884] px-4 text-base font-semibold text-[#06281f] transition hover:bg-[#12bd97] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Processando..."
                    : mode === "signup"
                    ? "Criar conta"
                    : "Entrar"}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#1f2c33] bg-[#111b21] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[#9fb0b8]">Sessão autenticada</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{userLabel}</h2>
                  <p className="mt-1 text-sm text-[#9fb0b8]">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl border border-[#31454d] px-3 py-2 text-sm text-[#d3dde1] transition hover:border-[#00a884] hover:text-white"
                >
                  Sair
                </button>
              </div>

              <div className="mt-5 rounded-[24px] border border-[#1f2c33] bg-[#0d171c] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#9fb0b8]">Status do WhatsApp</p>
                    <strong className="mt-1 block text-base text-white">
                      {sessionStatus === "connected"
                        ? "Conectado"
                        : sessionStatus === "pairing"
                        ? "Aguardando leitura do QR"
                        : "Preparando sessão"}
                    </strong>
                  </div>
                  <span className="rounded-full bg-[#122229] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#7ad6bd]">
                    {sessionStatus}
                  </span>
                </div>

                <ol className="mt-4 space-y-2 text-sm leading-6 text-[#c5d1d6]">
                  <li>1. Abra o WhatsApp no seu celular.</li>
                  <li>2. Entre em aparelhos conectados.</li>
                  <li>3. Escolha conectar um aparelho.</li>
                  <li>4. Escaneie o QR Code abaixo.</li>
                </ol>

                <div className="mt-5 flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-[#29424a] bg-[#111b21] p-4">
                  {sessionStatus === "pairing" && qrCode ? (
                    <img
                      src={qrCode}
                      alt="QR Code do WhatsApp"
                      className="h-full w-full max-w-[260px] rounded-2xl bg-white p-3"
                    />
                  ) : (
                    <div className="text-center text-sm text-[#9fb0b8]">
                      {sessionStatus === "connected"
                        ? "Seu número já está conectado. Redirecionando..."
                        : "Gerando o QR Code da sua sessão."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
