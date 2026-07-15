import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';
import { authFetch } from '@/lib/authFetch';

export default function SelecionarEmpresa() {
  const router = useRouter();
  const { perfil, carregando: carregandoAuth } = useAuth();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!perfil) return;

    if (perfil.role === 'cliente_suporte') {
      router.push('/');
      return;
    }

    async function carregarEmpresas() {
      const res = await authFetch('/api/empresas');
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data);
      }
      setCarregando(false);
    }

    carregarEmpresas();
  }, [perfil]);

  function selecionar(empresaId: string) {
    localStorage.setItem('viva_empresa_selecionada', empresaId);
    router.push('/');
  }

  if (carregandoAuth || carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="VIVA Platform" className="h-12 w-auto" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
          Escolha a empresa
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Você tem acesso a mais de uma empresa. Selecione qual deseja visualizar.
        </p>

        {empresas.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">Nenhuma empresa disponível.</p>
        ) : (
          <div className="space-y-3">
            {empresas.map((empresa) => (
              <button
                key={empresa.id}
                onClick={() => selecionar(empresa.id)}
                className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 hover:border-red-600 hover:bg-red-50 transition"
              >
                <p className="font-medium text-gray-900">{empresa.nome}</p>
                {empresa.posicionamento && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{empresa.posicionamento}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
