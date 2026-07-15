import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '@/lib/supabaseClient';

interface Perfil {
  id: string;
  email: string;
  nome: string | null;
  role: 'master' | 'suporte' | 'cliente_suporte';
  empresas: string[];
}

export function useAuth() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    verificarSessao();

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setPerfil(null);
        router.push('/login');
      } else {
        buscarPerfil(session.user.id);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function verificarSessao() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
      setCarregando(false);
      router.push('/login');
      return;
    }

    await buscarPerfil(session.user.id);
  }

  async function buscarPerfil(userId: string) {
    const { data, error } = await supabaseClient
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar perfil:', error);
      setPerfil(null);
    } else {
      setPerfil(data as Perfil);
    }
    setCarregando(false);
  }

  async function logout() {
    await supabaseClient.auth.signOut();
    router.push('/login');
  }

  return { perfil, carregando, logout };
}
