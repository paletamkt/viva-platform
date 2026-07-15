import { useState } from 'react';
import { Analise } from '@/lib/types';
import { authFetch } from '@/lib/authFetch';

interface AnalisesModalProps {
  analise: Analise;
  onClose: () => void;
  onDeleted?: () => void;
  role?: 'master' | 'suporte' | 'cliente_suporte';
}

export default function AnalisesModal({ analise, onClose, onDeleted, role }: AnalisesModalProps) {
  const jsonRaw: any = analise.analise_json || {};

  const pilares = jsonRaw.pilares || jsonRaw.cinco_pilares || [];
  const sentimentoRaw = jsonRaw.sentimento || {};
  const sentimento = {
    score: typeof sentimentoRaw.score === 'number' ? sentimentoRaw.score : 0,
    geral: sentimentoRaw.geral || sentimentoRaw.classificacao || 'neutro',
    justificativa: sentimentoRaw.justificativa || '',
  };
  const problemas: string[] = jsonRaw.problemas || [];
  const oportunidades: string[] = jsonRaw.oportunidades || [];
  const acoesRecomendadas: string[] = jsonRaw.acoes_recomendadas || [];
  const resumo: string = jsonRaw.resumo || '';

  const podeExcluir = role === 'master';

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [baixando, setBaixando] = useState(false);

  async function downloadConversaOriginal() {
    setBaixando(true);
    try {
      const res = await authFetch(`/api/analises/${analise.id}`);
      if (!res.ok) throw new Error('Falha ao buscar conversa completa');
      const dataCompleta = await res.json();

      const conteudo = dataCompleta.conversa_original || '';
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
    } catch (error) {
      console.error('Erro ao baixar conversa:', error);
      alert('Erro ao baixar a conversa. Tente novamente.');
    } finally {
      setBaixando(false);
    }
  }

  async function handleExcluir() {
    setExcluindo(true);
    try {
      const res = await authFetch(`/api/analises/${analise.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Falha ao excluir análise');
      }

      onClose();
      if (onDeleted) onDeleted();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir a análise. Tente novamente.');
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
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
              disabled={baixando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              {baixando ? 'Baixando...' : '📥 Baixar conversa (.txt)'}
            </button>
            {podeExcluir && (
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                🗑️ Excluir
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Confirmação de exclusão */}
        {confirmandoExclusao && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <p className="text-red-800 font-medium mb-3">
              Tem certeza que deseja excluir esta análise? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExcluir}
                disabled={excluindo}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {excluindo ? 'Excluindo...' : 'Sim, excluir'}
              </button>
              <button
                onClick={() => setConfirmandoExclusao(false)}
                disabled={excluindo}
                className="bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Sentimento */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">😊 Sentimento Geral</h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{sentimento.score}%</p>
                  <p className="text-lg font-medium text-gray-700 mt-2 capitalize">
                    {sentimento.geral.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        sentimento.score >= 90 ? 'bg-green-600' :
                        sentimento.score >= 75 ? 'bg-blue-600' :
                        sentimento.score >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${sentimento.score}%` }}
                    />
                  </div>
                </div>
              </div>
              {sentimento.justificativa && (
                <p className="text-gray-700 mt-4">{sentimento.justificativa}</p>
              )}
            </div>
          </section>

          {/* 5 Pilares */}
          {pilares.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 5 Pilares de Análise</h3>
              <div className="space-y-4">
                {pilares.map((pilar: any, idx: number) => (
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
          )}

          {/* Resumo */}
          {resumo && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{resumo}</p>
            </section>
          )}

          {/* Problemas */}
          {problemas.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Problemas Detectados</h3>
              <ul className="space-y-2">
                {problemas.map((problema, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 bg-red-50 p-3 rounded-lg">
                    <span>❌</span>
                    <span>{problema}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Oportunidades */}
          {oportunidades.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Oportunidades</h3>
              <ul className="space-y-2">
                {oportunidades.map((oportunidade, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 bg-blue-50 p-3 rounded-lg">
                    <span>✨</span>
                    <span>{oportunidade}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Ações Recomendadas */}
          {acoesRecomendadas.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4">✅ Ações Recomendadas</h3>
              <ul className="space-y-2">
                {acoesRecomendadas.map((acao, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 bg-green-50 p-3 rounded-lg">
                    <span>→</span>
                    <span>{acao}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
