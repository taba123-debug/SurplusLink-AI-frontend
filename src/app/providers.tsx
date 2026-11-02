import React, { useEffect, useState } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { api } from '@/services/api';
import { HttpMarketplaceApi } from '@/services/http/httpMarketplaceApi';
import { useDemoStore } from '@/store/useDemoStore';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const orgId = useDemoStore(s => s.currentOrg.id);
  const [ready, setReady] = useState(!(api instanceof HttpMarketplaceApi));
  const [error, setError] = useState('');
  useEffect(() => {
    if (!(api instanceof HttpMarketplaceApi)) return;
    let active = true;
    api.loadIdentities().then(organizations => {
      if (!organizations.length) throw new Error('No supported demo identities are available. Seed the backend demo data.');
      if (active) { useDemoStore.getState().setOrganizations(organizations); setReady(true); }
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  if (!ready) return <main className="p-8 text-center" role="status">
    {error ? <><p role="alert">{error}</p><button className="underline mt-4" onClick={() => window.location.reload()}>Retry connection</button></> : 'Connecting to demo marketplace…'}</main>;
  return <SessionProvider key={orgId}>{children}</SessionProvider>;
}

function SessionProvider({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: (error) => toast.error('Could not load marketplace data', { description: error.message }) }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {import.meta.env.VITE_DATA_PROVIDER === 'mock' && <div role="status" className="p-3 bg-amber-100 text-center text-sm">Offline simulation: inventory, AI extraction and transactions are mocked.</div>}
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </QueryClientProvider>
  );
}
