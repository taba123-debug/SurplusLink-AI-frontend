import { Button } from '@/components/ui/button';

export function ApiError({ error, retry }: { error: Error | null; retry: () => unknown }) {
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
    <h2 className="font-bold">Could not load marketplace data</h2>
    <p className="text-sm">{error?.message || 'The API request failed. Please try again.'}</p>
    <Button variant="outline" onClick={() => { retry(); }}>Retry</Button>
  </div>;
}
