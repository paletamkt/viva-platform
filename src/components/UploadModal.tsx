import { useState } from 'react';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [conversa, setConversa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function downloadTxt() {
    if (!conversa || conversa.length < 50) {
      setError('Nada pra baixar (conversa vazia ou muito curta)');
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([conversa], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `conversa_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Nova Análise</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content — Dividido em 2 Colunas */}
        <div className="flex flex-1 overflow-hidden">
          {/* ESQUERDA — Digitar */}
          <div className="flex-1 flex flex-col border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">✏️ Digitar Conversa</h3>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cole a conversa do WhatsApp
            </label>
            
            <textarea
              value={conversa}
              onChange={(e) => setConversa(e.target.value)}
              placeholder="10/07/2026, 14:22 - Cliente: Oi, quero pizza pra meu aniversário..."
              className="flex-1 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
            />
            
            <p className="text-xs text-gray-500 mt-2">
              {conversa.length} caracteres
            </p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
                {error}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleSubmit(conversa)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
              >
                {loading ? '🔄 Analisando...' : '✨ Analisar'}
              </button>
              
              <button
                onClick={downloadTxt}
                disabled={!conversa || conversa.length < 50}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition"
              >
                📥 Baixar .txt
              </button>
            </div>
          </div>

          {/* DIREITA — Upload */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-6">📁 Ou Faça Upload</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-full flex-1 flex flex-col items-center justify-center">
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
              <label htmlFor="file-input" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                <p className="text-4xl mb-4">📄</p>
                <p className="font-medium text-gray-900 text-lg">
                  Clique aqui
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  para selecionar arquivo .txt
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  ou arraste aqui
                </p>
              </label>
            </div>

            {loading && (
              <div className="text-center text-gray-600 mt-4">
                🔄 Processando arquivo...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
