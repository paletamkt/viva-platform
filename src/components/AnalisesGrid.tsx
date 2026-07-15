import { Analise } from '@/lib/types';
import { useState } from 'react';
import AnalisesModal from './AnalisesModal';

interface AnalisesGridProps {
  analises: Analise[];
}

export default function AnalisesGrid({ analises }: AnalisesGridProps) {
  const [selectedAnalise, setSelectedAnalise] = useState<Analise | null>(null);

  if (analises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhuma análise realizada ainda</p>
        <p className="text-sm text-gray-500 mt-2">Clique em "Nova Análise" para começar</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analises.map((analise) => (
          <div
            key={analise.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer"
            onClick={() => setSelectedAnalise(analise)}
          >
            {/* Cliente */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {analise.cliente_nome || `Cliente ${analise.contato.slice(-4)}`}
              </h3>
              <p className="text-sm text-gray-600">
                📱 {analise.contato ? `+55 (${analise.contato.slice(2, 4)}) ${analise.contato.slice(4, 9)}-${analise.contato.slice(9)}` : 'Sem contato'}
              </p>
            </div>

            {/* Datas */}
            <div className="text-xs text-gray-500 space-y-1 mb-4">
              <p>📅 Conversa: {new Date(analise.data_conversa_inicio).toLocaleString('pt-BR')}</p>
              <p>⬆️ Upload: {new Date(analise.data_upload).toLocaleString('pt-BR')}</p>
              <p>💬 Última msg: {new Date(analise.data_ultima_mensagem).toLocaleString('pt-BR')}</p>
            </div>

            {/* Sentimento */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Sentimento</span>
                  <span className="text-sm font-bold text-gray-900">{analise.sentimento_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      analise.sentimento_score >= 90 ? 'bg-green-600' :
                      analise.sentimento_score >= 75 ? 'bg-blue-600' :
                      analise.sentimento_score >= 50 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${analise.sentimento_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                analise.status === 'confirmado'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {analise.status === 'confirmado' ? '✓ Confirmado' : '⏳ Pendente'}
              </span>
            </div>

            {/* CTA */}
            <button className="mt-4 w-full text-red-600 hover:text-red-700 font-medium text-sm">
              Ver análise completa →
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedAnalise && (
        <AnalisesModal
          analise={selectedAnalise}
          onClose={() => setSelectedAnalise(null)}
        />
      )}
    </>
  );
}
