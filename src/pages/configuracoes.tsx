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

type TabPrincipal = 'empresas' | 'usuarios' | 'nivel2';

export default function Configuracoes() {
  const router = useRouter();
  const { perfil, carregando: carregandoAuth } = useAuth();

  const [tabPrincipal, setTabPrincipal] = useState<TabPrincipal>('empresas');
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [analises, setAnalises] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState<string | null>(null);
  const [editandoEmpresa, setEditandoEmpresa] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState({ nome: '', posicionamento: '', tom_recomendado: '', nivel: 1 });
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);

  const [mostrarFormNovaEmpresa, setMostrarFormNovaEmpresa] = useState(false);
  const [novaEmpresa, setNovaEmpresa] = useState({ id: '', nome: '', posicionamento: '', tom_recomendado: '' });
  const [criandoEmpresa, setCriandoEmpresa] = useState(false);

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
    const [resEmpresas, resUsuarios, resAnalises] = await Promise.all([
      authFetch('/api/empresas', {}, { semFiltroEmpresa: true }),
      authFetch('/api/usuarios'),
      authFetch('/api/analises', {}, { semFiltroEmpresa: true }),
    ]);
    let listaEmpresas: any[] = [];
    if (resEmpresas.ok) listaEmpresas = await resEmpresas.json();
    if (resUsuarios.ok) setUsuarios(await resUsuarios.json());
    if (resAnalises.ok) setAnalises(await resAnalises.json());

    setEmpresas(listaEmpresas);
    if (!empresaSelecionadaId && listaEmpresas.length > 0) {
      selecionarEmpresa(listaEmpresas[0]);
    }
    setCarregando(false);
  }

  function selecionarEmpresa(empresa: any) {
    setEmpresaSelecionadaId(empresa.id);
    setFormEmpresa({
      nome: empresa.nome || '',
      posicionamento: empresa.posicionamento || '',
      tom_recomendado: empresa.tom_recomendado || '',
      nivel: empresa.nivel || 1,
    });
    setEditandoEmpresa(false);
  }

  const empresaAtual = empresas.find((e) => e.id === empresaSelecionadaId);
  const conversasDaEmpresa = analises.filter((a) => a.cliente_id === empresaSelecionadaId);
  const usuariosDaEmpresa = usuarios.filter(
    (u) => u.role !== 'cliente_suporte' || (u.empresas || []).includes(empresaSelecionadaId)
  );

  async function handleSalvarEmpresa() {
    if (!empresaSelecionadaId) return;
    setSalvandoEmpresa(true);
    try {
      await authFetch(`/api/empresas/${empresaSelecionadaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEmpresa),
      });
      setEditandoEmpresa(false);
      await carregarDados();
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvandoEmpresa(false);
    }
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
      setMostrarFormNovaEmpresa(false);
      await carregarDados();
    } catch {
      alert('Erro ao criar empresa. Tente novamente.');
    } finally {
      setCriandoEmpresa(false);
    }
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <button
            onClick={() => router.push('/')}
            className="text-red-100 hover:text-white text-sm font-medium border border-red-300 hover:border-white px-3 py-1.5 rounded-lg transition"
          >
            ← Voltar
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Abas principais */}
        <div className="flex gap-1 border-b border-gray-200 bg-white rounded-t-lg mt-6 px-2">
          {[
            { id: 'empresas', label: 'Empresas' },
            { id: 'usuarios', label: 'Usuários' },
            { id: 'nivel2', label: 'Nível 2' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTabPrincipal(t.id as TabPrincipal)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                tabPrincipal === t.id
                  ? 'text-red-600 border-red-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 min-h-[500px]">
          {tabPrincipal === 'empresas' && (
            <div className="flex">
              {/* Sidebar de empresas */}
              <div className="w-56 border-r border-gray-200 py-3 flex-shrink-0">
                <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Clientes</p>
                {empresas.map((empresa) => (
                  <button
                    key={empresa.id}
                    onClick={() => selecionarEmpresa(empresa)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      empresaSelecionadaId === empresa.id
                        ? 'bg-red-50 border-l-2 border-red-600 font-medium text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                    }`}
                  >
                    {empresa.nome}
                  </button>
                ))}
                <button
                  onClick={() => setMostrarFormNovaEmpresa(!mostrarFormNovaEmpresa)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition mt-2"
                >
                  + Nova empresa
                </button>
              </div>

              {/* Painel de detalhes */}
              <div className="flex-1 p-6">
                {mostrarFormNovaEmpresa ? (
                  <form onSubmit={handleCriarEmpresa} className="space-y-3 max-w-md">
                    <h3 className="font-bold text-gray-900 mb-2">Nova empresa</h3>
                    <input
                      placeholder="ID (ex: loppifest)"
                      value={novaEmpresa.id}
                      onChange={(e) => setNovaEmpresa({ ...novaEmpresa, id: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      required
                    />
                    <input
                      placeholder="Nome"
                      value={novaEmpresa.nome}
                      onChange={(e) => setNovaEmpresa({ ...novaEmpresa, nome: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      required
                    />
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
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={criandoEmpresa}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                      >
                        {criandoEmpresa ? 'Criando...' : 'Criar empresa'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMostrarFormNovaEmpresa(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : empresaAtual ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">{empresaAtual.nome}</h2>
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-lg">
                          Nível {empresaAtual.nivel}
                        </span>
                      </div>
                      {!editandoEmpresa && (
                        <button
                          onClick={() => setEditandoEmpresa(true)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Editar
                        </button>
                      )}
                    </div>

                    {editandoEmpresa ? (
                      <div className="space-y-3 max-w-md mb-6">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Nome</label>
                          <input
                            value={formEmpresa.nome}
                            onChange={(e) => setFormEmpresa({ ...formEmpresa, nome: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Posicionamento</label>
                          <textarea
                            value={formEmpresa.posicionamento}
                            onChange={(e) => setFormEmpresa({ ...formEmpresa, posicionamento: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Tom recomendado</label>
                          <input
                            value={formEmpresa.tom_recomendado}
                            onChange={(e) => setFormEmpresa({ ...formEmpresa, tom_recomendado: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Nível</label>
                          <select
                            value={formEmpresa.nivel}
                            onChange={(e) => setFormEmpresa({ ...formEmpresa, nivel: Number(e.target.value) })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value={1}>Nível 1</option>
                            <option value={2}>Nível 2</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSalvarEmpresa}
                            disabled={salvandoEmpresa}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                          >
                            {salvandoEmpresa ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => setEditandoEmpresa(false)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500">Conversas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{conversasDaEmpresa.length}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500">Usuários vinculados</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{usuariosDaEmpresa.length}</p>
                          </div>
                        </div>

                        {empresaAtual.posicionamento && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Posicionamento</p>
                            <p className="text-sm text-gray-800">{empresaAtual.posicionamento}</p>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Usuários desta empresa</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden max-w-md">
                        {usuariosDaEmpresa.length === 0 ? (
                          <p className="text-sm text-gray-400 px-4 py-3">Nenhum usuário vinculado ainda.</p>
                        ) : (
                          usuariosDaEmpresa.map((u, idx) => (
                            <div
                              key={u.id}
                              className={`flex justify-between px-4 py-2.5 text-sm ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                            >
                              <span className="text-gray-900">{u.nome || u.email}</span>
                              <span className="text-gray-500">
                                {u.role === 'master' ? 'Master' : u.role === 'suporte' ? 'Suporte' : 'Cliente-Suporte'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada ainda.</p>
                )}
              </div>
            </div>
          )}

          {tabPrincipal === 'usuarios' && (
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Para criar um novo usuário, adicione-o direto no painel do Supabase (Authentication → Users) e depois configure o papel dele aqui.
              </p>
              <div className="space-y-2">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="border border-gray-200 rounded-lg p-4">
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
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <select
                          multiple
                          value={usuario.empresas || []}
                          onChange={(e) =>
                            handleAtualizarUsuario(
                              usuario.id,
                              'empresas',
                              Array.from(e.target.selectedOptions, (o) => o.value)
                            )
                          }
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm min-w-[220px]"
                        >
                          {empresas.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.nome}</option>
                          ))}
                        </select>
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
            </div>
          )}

          {tabPrincipal === 'nivel2' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RECURSOS_NIVEL_2.map((recurso, idx) => (
                  <div key={idx} className="relative bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-hidden">
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
            </div>
          )}
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
