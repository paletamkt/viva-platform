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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VIVA Platform</h1>
              <p className="text-gray-600 mt-1">Análise Inteligente de Conversas</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              + Nova Análise
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total de Conversas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalConversas}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Clientes Únicos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.clientesUnicos}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Sentimento Médio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.sentimentoMedio}%</p>
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
