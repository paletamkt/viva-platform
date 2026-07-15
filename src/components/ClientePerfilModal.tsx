import { useState } from 'react';
import AnalisesModal from './AnalisesModal';
import { Analise } from '@/lib/types';
import { authFetch } from '@/lib/authFetch';

interface ClientePerfilModalProps {
  cliente: any;
  todosClientes?: any[];
  onClose: () => void;
  onChanged?: () => void;
  role?: 'master' | 'suporte' | 'cliente_suporte';
}

export default function ClientePerfilModal({
  cliente,
  todosClientes = [],
  onClose,
  onChanged,
  role,
}: ClientePerfilModalProps) {
  const [selectedAnalise, setSelectedAnalise] = useState<Analise | null>(null);

  const podeGerenciar = role === 'master' || role === 'suporte';

  const [nomeAtual, setNomeAtual] = useState<string>(cliente.cliente_nome || '');
  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeInput, setNomeInput] = useState(nomeAtual);
  const [salvandoNome, setSalvandoNome] = useState(false);

  const [mesclando, setMesclando] = useState(false);
  const [targetMerge, setTargetMerge] = useState('');
  const [confirmandoMerge, setConfirmandoMerge] = useState(false);
  const [processandoMerge, setProcessandoMerge] = useState(false);

  const conversas = cliente.conversas || [];

  const sentimentoMedio =
    conversas.length > 0
      ? Math.round(
          conversas.reduce((acc: number, c: any) => acc + (c.sentimento_score || 0), 0) /
            conversas.length
        )
      : 0;

  const outrosClientes = todosClientes.filter((c) => c.contato !== cliente.contato);

  async function handleSalvarNome() {
    if (!nomeInput.trim()) return;
    setSalvandoNome(true);
    try {
      const res = await authFetch(`/api/clientes/${cliente.contato}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_nome: nomeInput.trim() }),
      });

      if (!res.ok) throw new Error('Falha ao salvar nome');

      setNomeAtual(nomeInput.trim());
      setEditandoNome(false);
      if (onChanged) onChanged();
    } catch (error) {
      console.error('Erro ao salvar nome:', error);
      alert('Erro ao salvar o nome. Tente novamente.');
    } finally {
      setSalvandoNome(false);
    }
  }

  async function handleConfirmarMerge() {
    if (!targetMerge) return;
    setProcessandoMerge(true);
    try {
      const res = await authFetch('/api/clientes/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contatoOrigem: cliente.contato,
          contatoDestino: targetMerge,
          cliente_nome: nomeAtual || undefined,
        }),
      });

      if (!res.ok) throw new Error('Falha ao mesclar clientes');

      if (onChanged) onChanged();
      onClose();
    } catch (error) {
      console.error('Erro ao mesclar:', error);
      alert('Erro ao mesclar clientes. Tente novamente.');
      setProcessandoMerge(false);
      setConfirmandoMerge(false);
    }
  }

  if (selectedAnalise) {
    return (
      <AnalisesModal
        analise={selectedAnalise}
        onClose={() => setSelectedAnalise(null)}
        onDeleted={() => {
          setSelectedAnalise(null);
          if (onChanged) onChanged();
          onClose();
        }}
        role={role}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {editandoNome ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
                    className="text-xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleSalvarNome}
                    disabled={salvandoNome || !nomeInput.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    {salvandoNome ? '...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => {
                      setEditandoNome(false);
                      setNomeInput(nomeAtual);
                    }}
                    disabled={salvandoNome}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {nomeAtual || `Cliente ${cliente.contato.slice(-4)}`}
                  </h2>
                  {podeGerenciar && (
                    <button
                      onClick={() => {
                        setNomeInput(nomeAtual);
                        setEditandoNome(true);
                      }}
                      className="text-gray-400 hover:text-gray-700 text-sm"
                      title="Editar nome"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600">
                📱 +55 ({cliente.contato.slice(2, 4)}) {cliente.contato.slice(4)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
            >
              ×
            </button>
          </div>

          {podeGerenciar && outrosClientes.length > 0 && (
            <button
              onClick={() => setMesclando(!mesclando)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              🔗 Este cliente está duplicado? Mesclar com outro
            </button>
          )}

          {podeGerenciar && mesclando && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Escolha o cliente que deve receber as conversas deste perfil:
              </p>
              <select
                value={targetMerge}
                onChange={(e) => setTargetMerge(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
              >
                <option value="">Selecione um cliente...</option>
                {outrosClientes.map((c) => (
                  <option key={c.contato} value={c.contato}>
                    {c.cliente_nome || `Cliente ${c.contato.slice(-4)}`} — +55 ({c.contato.slice(2, 4)}) {c.contato.slice(4)} ({(c.conversas || []).length} conversa(s))
                  </option>
                ))}
              </select>

              {!confirmandoMerge ? (
                <button
                  onClick={() => setConfirmandoMerge(true)}
                  disabled={!targetMerge}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Mesclar
                </button>
              ) : (
                <div>
                  <p className="text-sm text-red-700 font-medium mb-2">
                    As {conversas.length} conversa(s) deste perfil serão movidas para o cliente selecionado, e este perfil deixará de existir. Confirma?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmarMerge}
                      disabled={processandoMerge}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      {processandoMerge ? 'Mesclando...' : 'Sim, mesclar'}
                    </button>
                    <button
                      onClick={() => setConfirmandoMerge(false)}
                      disabled={processandoMerge}
                      className="bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
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

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Histórico de Conversas</h3>
            <div className="space-y-3">
              {conversas.map((conversa: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
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

                  <p className="text-xs text-gray-500 mb-2">
                    Upload: {new Date(conversa.data_upload).toLocaleString('pt-BR')}
                  </p>

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
