import { useState } from 'react';
import AnalisesModal from './AnalisesModal';
import { Analise } from '@/lib/types';

interface ClientePerfilModalProps {
  cliente: any;
  onClose: () => void;
}

export default function ClientePerfilModal({ cliente, onClose }: ClientePerfilModalProps) {
  const [selectedAnalise, setSelectedAnalise] = useState<Analise | null>(null);
  const conversas = cliente.conversas || [];

  const sentimentoMedio =
    conversas.length > 0
      ? Math.round(
          conversas.reduce((acc: number, c: any) => acc + (c.sentimento_score || 0), 0) /
            conversas.length
        )
      : 0;

  if (selectedAnalise) {
    return <AnalisesModal analise={selectedAnalise} onClose={() => setSelectedAnalise(null)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {cliente.cliente_nome || `Cliente ${cliente.contato.slice(-4)}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              📱 +55 ({cliente.contato.slice(2, 4)}) {cliente.contato.slice(4)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Métricas */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Métricas</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Conversas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{conversas.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Sentimento Médio</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{sentimentoMedio}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Período</p>
                <p className="text-sm font-bold text-gray-900 mt-2">
                  {conversas.length > 0 &&
                    `${new Date(conversas[conversas.length - 1].data_conversa_inicio).toLocaleDateString(
                      'pt-BR'
                    )} — ${new Date(conversas[0].data_conversa_inicio).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
            </div>
          </section>

          {/* Histórico */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Histórico de Conversas</h3>
            <div className="space-y-3">
              {conversas.map((conversa: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  {/* Data */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      📅{' '}
                      {new Date(conversa.data_conversa_inicio).toLocaleString('pt-BR', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' → '}
                      {new Date(conversa.data_ultima_mensagem).toLocaleString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Upload info */}
                  <p className="text-xs text-gray-500 mb-2">
                    Upload: {new Date(conversa.data_upload).toLocaleString('pt-BR')}
                  </p>

                  {/* Sentimento */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg">
                          {i < Math.round(conversa.sentimento_score / 20) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {conversa.sentimento_score}%
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        conversa.status === 'confirmado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {conversa.status === 'confirmado' ? '✓ Confirmado' : '⏳ Pendente'}
                    </span>
                    <button
                      onClick={() => setSelectedAnalise(conversa)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Abrir análise
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
