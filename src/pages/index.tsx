import { useState, useEffect } from 'react';
import { getAnalises, getClientesPorContato } from '@/lib/supabase';
import { Analise } from '@/lib/types';
import UploadModal from '@/components/UploadModal';
import AnalisesGrid from '@/components/AnalisesGrid';
import ClientesGrid from '@/components/ClientesGrid';

export default function Home() {
  const [tab, setTab] = useState<'conversas' | 'clientes'>('conversas');
  const [analises, setAnalises] = useState<Analise[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'conversas') {
        const data = await getAnalises();
        setAnalises(data as Analise[]);
      } else {
        const data = await getClientesPorContato();
        setClientes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    loadData();
  };

  const stats = {
    totalConversas: analises.length,
    clientesUnicos: clientes.length,
    sentimentoMedio: analises.length > 0
      ? Math.round(analises.reduce((acc, a) => acc + (a.sentimento_score || 0), 0) / analises.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white">🍕 VIVA Platform</h1>
              <p className="text-red-100 mt-2">Análise Inteligente de Conversas com Claude AI</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white hover:bg-red-50 text-red-600 px-8 py-3 rounded-lg font-bold transition shadow-lg hover:shadow-xl"
            >
              ✨ + Nova Análise
            </button>
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
          <AnalisesGrid analises={analises} />
        ) : (
          <ClientesGrid clientes={clientes} />
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
