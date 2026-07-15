import { useState } from 'react';
import ClientePerfilModal from './ClientePerfilModal';

interface ClientesGridProps {
  clientes: any[];
}

export default function ClientesGrid({ clientes }: ClientesGridProps) {
  const [selectedCliente, setSelectedCliente] = useState<any>(null);

  if (clientes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhum cliente cadastrado ainda</p>
        <p className="text-sm text-gray-500 mt-2">Clique em "Nova Análise" para começar</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cliente, idx) => {
          const conversas = cliente.conversas || [];
          const sentimentoMedio =
            conversas.length > 0
              ? Math.round(
                  conversas.reduce((acc: number, c: any) => acc + (c.sentimento_score || 0), 0) /
                    conversas.length
                )
              : 0;
          const ultimaConversa = conversas[0]?.data_upload;

          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedCliente(cliente)}
            >
              {/* Avatar + Nome */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">
                    {cliente.cliente_nome === cliente.cliente_nome.toUpperCase() ? '👤' : '🔶'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {cliente.cliente_nome || `Cliente ${idx + 1}`}
                  </h3>
                  <p className="text-xs text-gray-600">
                    📱 +55 ({cliente.contato.slice(2, 4)}) {cliente.contato.slice(4)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm text-gray-600">{conversas.length} conversa(s)</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Sentimento médio</span>
                    <span className="text-sm font-bold text-gray-900">{sentimentoMedio}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        sentimentoMedio >= 90 ? 'bg-green-600' :
                        sentimentoMedio >= 75 ? 'bg-blue-600' :
                        sentimentoMedio >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${sentimentoMedio}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Última conversa */}
              {ultimaConversa && (
                <p className="text-xs text-gray-500 mb-4">
                  Última: {new Date(ultimaConversa).toLocaleDateString('pt-BR')}
                </p>
              )}

              {/* Status */}
              <div className="flex gap-2 text-xs text-green-700 mb-4">
                <span>✓ Histórico limpo</span>
              </div>

              {/* CTA */}
              <button className="w-full text-red-600 hover:text-red-700 font-medium text-sm">
                Ver perfil →
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedCliente && (
        <ClientePerfilModal
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </>
  );
}
