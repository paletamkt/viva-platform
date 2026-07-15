import { useState, useRef } from 'react';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Reseta o input para permitir reenviar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleFileUpload(file: File) {
    const text = await file.text();
    await handleSubmit(text);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-2">📁 Upload da Conversa</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Envie o arquivo .txt exportado do WhatsApp
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-full flex-1 flex flex-col items-center justify-center min-h-[240px]">
            <input
              ref={fileInputRef}
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

          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center text-gray-600 mt-4">
              🔄 Processando arquivo...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}