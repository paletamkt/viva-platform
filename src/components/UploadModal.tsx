import { useState, useRef, useEffect } from 'react';
import { authFetch } from '@/lib/authFetch';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MENSAGENS_LOADING = [
  'Lendo a conversa...',
  'Identificando o contato...',
  'Analisando com IA...',
  'Calculando os 5 pilares...',
  'Quase lá...',
];

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensagemIdx, setMensagemIdx] = useState(0);
  const [demorando, setDemorando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      setMensagemIdx(0);
      setDemorando(false);
      return;
    }

    const intervaloMensagem = setInterval(() => {
      setMensagemIdx((prev) => Math.min(prev + 1, MENSAGENS_LOADING.length - 1));
    }, 3500);

    const timeoutDemora = setTimeout(() => {
      setDemorando(true);
    }, 20000);

    return () => {
      clearInterval(intervaloMensagem);
      clearTimeout(timeoutDemora);
    };
  }, [loading]);

  async function handleSubmit(texto: string) {
    if (!texto || texto.length < 50) {
      setError('Conversa muito curta (mínimo 50 caracteres)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/analisar', {
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

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
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
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Nova Análise</h2>
          {!loading && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full min-h-[240px] text-center">
              <div className="w-14 h-14 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-6" />
              <p className="text-lg font-medium text-gray-900 transition-opacity duration-300">
                {MENSAGENS_LOADING[mensagemIdx]}
              </p>
              <div className="flex gap-1 mt-4">
                {MENSAGENS_LOADING.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx <= mensagemIdx ? 'bg-red-600 w-6' : 'bg-gray-200 w-1.5'
                    }`}
                  />
                ))}
              </div>
              {demorando && (
                <p className="text-sm text-gray-500 mt-6 max-w-sm">
                  Isso está demorando um pouco mais que o normal. Sem problema, ainda estamos processando — aguarde mais um instante.
                </p>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
