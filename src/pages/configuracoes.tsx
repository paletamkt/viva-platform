import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';
import { authFetch } from '@/lib/authFetch';

const RECURSOS_NIVEL_2 = [
  { titulo: 'Editar contexto da empresa pela plataforma', descricao: 'Ajuste posicionamento, tom e objeções sem precisar de SQL.' },
  { titulo: 'Editor de prompt', descricao: 'Personalize como a IA analisa as conversas, direto pela interface.' },
  { titulo: 'Audit Log', descricao: 'Veja o histórico completo de quem fez o quê na plataforma.' },
  { titulo: 'Reanálise automática', descricao: 'Reprocesse conversas antigas com a versão mais recente do prompt.' },
];

export default function Configuracoes() {
  const router = useRouter();
  const { perfil, carregando: carregandoAuth } = useAuth();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [novaEmpresa, setNovaEmpresa] = useState({ id: '', nome: '', posicionamento: '', tom_recomendado: '' });
  const [criandoEmpresa, setCriandoEmpresa] = useState(false);
  const [mostrarFormEmpresa, setMostrarFormEmpresa] = useState(false);

  useEffect(() => {
    if (!perfil) return;
    if (perfil.role !== 'master') {
      router.push('/');
      return;
    }
    carregarDados();
  }, [perfil]);

  async function carregarDados() {
    setCarregando(true);
    const [resEmpresas, resUsuarios] = await Promise.all([
      authFetch('/api/empresas'),
      authFetch('/api/usuarios'),
    ]);
    if (resEmpresas.ok) setEmpresas(await resEmpresas.json());
    if (resUsuarios.ok) setUsuarios(await resUsuarios.json());
    setCarregando(false);
  }

  async function handleCriarEmpresa(e: React.FormEvent) {
    e.preventDefault();
    if (!novaEmpresa.id || !novaEmpresa.nome) return;

    setCriandoEmpresa(true);
    try {
      const res = await authFetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaEmpresa),
      });
      if (!res.ok) throw new Error('Falha ao criar empresa');

      setNovaEmpresa({ id: '', nome: '', posicionamento: '', tom_recomendado: '' });
      setMostrarFormEmpresa(false);
      await carregarDados();
    } catch (error) {
      alert('Erro ao criar empresa. Tente novamente.');
    } finally {
      setCriandoEmpresa(false);
    }
  }

  async function handleAtualizarNivel(empresaId: string, nivel: number) {
    await authFetch(`/api/empresas/${empresaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nivel }),
    });
    carregarDados();
  }

  async function handleAtualizarUsuario(userId: string, campo: string, valor: any) {
    await authFetch('/api/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, [campo]: valor }),
    });
    carregarDados();
  }

  if (carregandoAuth || carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!perfil || perfil.role !== 'master') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <button
            onClick={() => router.push('/')}
            className="text-red-100 hover:text-white text-sm font-medium border border-red-300 hover:border-white px-3 py-1.5 rounded-lg transition"
          >
            ← Voltar
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Empresas */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Empresas</h2>
            <button
              onClick={() => setMostrarFormEmpresa(!mostrarFormEmpresa)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              {mostrarFormEmpresa ? 'Cancelar' : '+ Nova empresa'}
            </button>
          </div>

          {mostrarFormEmpresa && (
            <form onSubmit={handleCriarEmpresa} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="ID (ex: loppifest)"
                  value={novaEmpresa.id}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, id: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
                <input
                  placeholder="Nome"
                  value={novaEmpresa.nome}
                  onChange={(e) => setNovaEmpresa({ ...novaEmpresa, nome: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <textarea
                placeholder="Posicionamento"
                value={novaEmpresa.posicionamento}
                onChange={(e) => setNovaEmpresa({ ...novaEmpresa, posicionamento: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
              <input
                placeholder="Tom recomendado"
                value={novaEmpresa.tom_recomendado}
                onChange={(e) => setNovaEmpresa({ ...novaEmpresa, tom_recomendado: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={criandoEmpresa}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {criandoEmpresa ? 'Criando...' : 'Criar empresa'}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {empresas.map((empresa) => (
              <div key={empresa.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{empresa.nome}</p>
                  <p className="text-xs text-gray-500">{empresa.id}</p>
                </div>
                <select
                  value={empresa.nivel}
                  onChange={(e) => handleAtualizarNivel(empresa.id, Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value={1}>Nível 1</option>
                  <option value={2}>Nível 2</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Usuários */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Usuários</h2>
          <p className="text-sm text-gray-500 mb-4">
            Para criar um novo usuário, adicione-o direto no painel do Supabase (Authentication → Users) e depois configure o papel dele aqui.
          </p>
          <div className="space-y-2">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{usuario.nome || usuario.email}</p>
                    <p className="text-xs text-gray-500">{usuario.email}</p>
                  </div>
                  <select
                    value={usuario.role}
                    onChange={(e) => handleAtualizarUsuario(usuario.id, 'role', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="master">Master</option>
                    <option value="suporte">Suporte</option>
                    <option value="cliente_suporte">Cliente-Suporte</option>
                  </select>
                </div>
                {usuario.role === 'cliente_suporte' && (
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      placeholder="IDs das empresas (separados por vírgula)"
                      defaultValue={(usuario.empresas || []).join(', ')}
                      onBlur={(e) =>
                        handleAtualizarUsuario(
                          usuario.id,
                          'empresas',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        defaultChecked={usuario.nivel2_liberado}
                        onChange={(e) => handleAtualizarUsuario(usuario.id, 'nivel2_liberado', e.target.checked)}
                      />
                      Nível 2 liberado
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recursos Nível 2 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recursos do Nível 2</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECURSOS_NIVEL_2.map((recurso, idx) => (
              <div key={idx} className="relative bg-white border border-gray-200 rounded-lg p-4 overflow-hidden">
                <div className="blur-[2px] pointer-events-none select-none opacity-60">
                  <p className="font-medium text-gray-900">{recurso.titulo}</p>
                  <p className="text-sm text-gray-600 mt-1">{recurso.descricao}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    🔒 Em breve
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
