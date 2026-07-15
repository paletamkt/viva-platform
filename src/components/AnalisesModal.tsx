import { Analise } from '@/lib/types';

interface AnalisesModalProps {
  analise: Analise;
  onClose: () => void;
}

export default function AnalisesModal({ analise, onClose }: AnalisesModalProps) {
  const json = analise.analise_json;

  function downloadConversaOriginal() {
    const conteudo = analise.conversa_original || '';
    const element = document.createElement('a');
    const file = new Blob([conteudo], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const nomeCliente = (analise.cliente_nome || `cliente_${analise.contato.slice(-4)}`)
      .toLowerCase()
      .replace(/\s+/g, '_');
    element.download = `conversa_${nomeCliente}_${analise.data_conversa_inicio.slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {analise.cliente_nome || `Cliente ${analise.contato.slice(-4)}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              📱 {analise.contato ? `+55 (${analise.contato.slice(2, 4)}) ${analise.contato.slice(4)}` : 'Sem contato'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadConversaOriginal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              📥 Baixar conversa (.txt)
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Sentimento */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">😊 Sentimento Geral</h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{json.sentimento.score}%</p>
                  <p className="text-lg font-medium text-gray-700 mt-2 capitalize">
                    {json.sentimento.geral.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        json.sentimento.score >= 90 ? 'bg-green-600' :
                        json.sentimento.score >= 75 ? 'bg-blue-600' :
                        json.sentimento.score >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${json.sentimento.score}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mt-4">{json.sentimento.justificativa}</p>
            </div>
          </section>

          {/* 5 Pilares */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 5 Pilares de Análise</h3>
            <div className="space-y-4">
              {json.pilares.map((pilar, idx) => (
                <div key={idx} className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{pilar.nome}</p>
                    <p className="text-lg font-bold text-gray-900">{pilar.score}%</p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${pilar.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-700">{pilar.descricao}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Resumo */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{json.resumo}</p>
          </section>

          {/* Problemas */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Problemas Detectados</h3>
            <ul className="space-y-2">
              {json.problemas.map((problema, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700 bg-red-50 p-3 rounded-lg">
                  <span>❌</span>
                  <span>{problema}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Oportunidades */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Oportunidades</h3>
            <ul className="space-y-2">
              {json.oportunidades.map((oportunidade, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700 bg-blue-50 p-3 rounded-lg">
                  <span>✨</span>
                  <span>{oportunidade}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Ações Recomendadas */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">✅ Ações Recomendadas</h3>
            <ul className="space-y-2">
              {json.acoes_recomendadas.map((acao, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700 bg-green-50 p-3 rounded-lg">
                  <span>→</span>
                  <span>{acao}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Metadados */}
          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-600 mb-3">Metadados</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-600">ID da Análise</p>
                <p className="font-mono text-xs">{analise.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Criado em</p>
                <p>{new Date(analise.criado_em).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-gray-600">Primeira mensagem</p>
                <p>{new Date(analise.data_conversa_inicio).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-gray-600">Última mensagem</p>
                <p>{new Date(analise.data_ultima_mensagem).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}