import { useState, useEffect } from 'react';
import { Analise } from '@/lib/types';
import UploadModal from '@/components/UploadModal';
import AnalisesGrid from '@/components/AnalisesGrid';
import ClientesGrid from '@/components/ClientesGrid';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const { perfil, carregando: carregandoAuth, logout } = useAuth();
  const [tab, setTab] = useState<'conversas' | 'clientes'>('conversas');
  const [analises, setAnalises] = useState<Analise[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (perfil) {
      loadAll();
    }
  }, [perfil]);

  async function loadAll() {
    setLoading(true);
    try {
      const [resAnalises, resClientes] = await Promise.all([
        fetch('/api/analises'),
        fetch('/api/clientes'),
      ]);

      if (!resAnalises.ok) throw new Error('Falha ao buscar análises');
      if (!resClientes.ok) throw new Error('Falha ao buscar clientes');

      const dataAnalises = await resAnalises.json();
      const dataClientes = await resClientes.json();

      setAnalises(dataAnalises as Analise[]);
      setClientes(dataClientes);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadAll();
  };

  const stats = {
    totalConversas: analises.length,
    clientesUnicos: clientes.length,
    sentimentoMedio: analises.length > 0
      ? Math.round(analises.reduce((acc, a) => acc + (a.sentimento_score || 0), 0) / analises.length)
      : 0,
  };

  if (carregandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!perfil) {
    return null; // useAuth já redireciona para /login
  }

  const nomeExibicao = perfil.nome || perfil.email;
  const roleLabel = perfil.role === 'master' ? 'Master' : perfil.role === 'suporte' ? 'Suporte' : 'Cliente-Suporte';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="bg-white/95 rounded-lg px-4 py-3 inline-block">
              <img src="/logo.png" alt="VIVA Platform" className="h-12 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-white font-medium text-sm">{nomeExibicao}</p>
                <p className="text-red-100 text-xs">{roleLabel}</p>
              </div>
              <button
                onClick={logout}
                className="text-red-100 hover:text-white text-sm font-medium border border-red-300 hover:border-white px-3 py-1.5 rounded-lg transition"
              >
                Sair
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-white hover:bg-red-50 text-red-600 px-8 py-3 rounded-lg font-bold transition shadow-lg hover:shadow-xl"
              >
                ✨ + Nova Análise
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total de Conversas</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{stats.totalConversas}</p>
              </div>
              <span className="text-4xl">💬</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Clientes Únicos</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{stats.clientesUnicos}</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Sentimento Médio</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{stats.sentimentoMedio}%</p>
              </div>
              <span className="text-4xl">😊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setTab('conversas')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              tab === 'conversas'
                ? 'text-red-600 border-red-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📊 Conversas ({analises.length})
          </button>
          <button
            onClick={() => setTab('clientes')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              tab === 'clientes'
                ? 'text-red-600 border-red-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            👥 Clientes ({clientes.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : tab === 'conversas' ? (
          <AnalisesGrid analises={analises} onChanged={loadAll} role={perfil.role} />
        ) : (
          <ClientesGrid clientes={clientes} onChanged={loadAll} role={perfil.role} />
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
