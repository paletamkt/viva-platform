import { useState } from 'react';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [conversa, setConversa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'digitar' | 'arquivo'>('digitar');

  async function handleSubmit(texto: string) {
    if (!texto || texto.length < 50) {
      setError('Conversa muito curta (mínimo 50 caracteres)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analisar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversa: texto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao processar');
      }

      alert('✅ Análise criada com sucesso!');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    const text = await file.text();
    await handleSubmit(text);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Nova Análise</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            <button
              onClick={() => setTab('digitar')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                tab === 'digitar'
                  ? 'text-red-600 border-red-600'
                  : 'text-gray-600 border-transparent'
              }`}
            >
              ✏️ Digitar
            </button>
            <button
              onClick={() => setTab('arquivo')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                tab === 'arquivo'
                  ? 'text-red-600 border-red-600'
                  : 'text-gray-600 border-transparent'
              }`}
            >
              📁 Upload .txt
            </button>
          </div>

          {/* Tab: Digitar */}
          {tab === 'digitar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cole a conversa do WhatsApp
                </label>
                <textarea
                  value={conversa}
                  onChange={(e) => setConversa(e.target.value)}
                  placeholder="10/07/2026, 14:22 - Cliente: Oi, quero pizza pra meu aniversário..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {conversa.length} caracteres
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={() => handleSubmit(conversa)}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
              >
                {loading ? '🔄 Analisando...' : '✨ Analisar Conversa'}
              </button>
            </div>
          )}

          {/* Tab: Arquivo */}
          {tab === 'arquivo' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  disabled={loading}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <p className="text-2xl mb-2">📁</p>
                  <p className="font-medium text-gray-900">
                    Clique para selecionar arquivo
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ou arraste um arquivo .txt aqui
                  </p>
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {loading && (
                <div className="text-center text-gray-600">
                  🔄 Processando arquivo...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
