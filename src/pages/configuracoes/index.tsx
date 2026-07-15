import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ConfiguracoesIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/configuracoes/empresas');
  }, []);

  return null;
}
