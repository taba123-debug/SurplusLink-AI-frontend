import { ApiError } from '@/components/shared/ApiError';
import { formatPKR } from '@/lib/money';
import { formatDate, getDaysRemaining } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  PackagePlus,
  Lock,
  Pause,
  Play,
  XCircle,
  Eye,
  Calendar,
} from 'lucide-react';
import { useDemoStore } from '@/store/useDemoStore';
import { useSellerInventory, useUpdateLotStatus } from '../hooks/useInventory';

export function SellerInventoryPage() {
  const navigate = useNavigate();
  const { currentOrg } = useDemoStore();
  const { data: lots, isLoading, error, refetch } = useSellerInventory();

  const sellerLots = (lots || []).filter((l) => l.sellerId === currentOrg.id);

  const statusMutation = useUpdateLotStatus();

  if (error) return <ApiError error={error} retry={refetch} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <Boxes className="w-4 h-4" />
            Inventory Asset Management
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            My Listed Surplus Inventory
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            Manage your organization's surplus bakery batches, monitor reserved stock, and control marketplace availability.
          </p>
        </div>

        <Link to="/seller/inventory/new">
          <Button variant="primary" size="sm" className="font-bold">
            <PackagePlus className="w-4 h-4 mr-1.5" />
            List New Surplus Batch
          </Button>
        </Link>
      </div>

      {/* Inventory List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : sellerLots.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-8 h-8 text-[#176B4D]" />}
          title="No Surplus Batches Listed"
          description="Your supplier account currently has no active surplus inventory lots. Upload a surplus batch to receive retail buyer offers."
          actionLabel="List Surplus Batch"
          onAction={() => navigate('/seller/inventory/new')}
        />
      ) : (
        <div className="space-y-4">
          {sellerLots.map((lot) => {
            const daysLeft = getDaysRemaining(lot.expiryDate);

            return (
              <div
                key={lot.id}
                className="rounded-2xl border border-[#E3EAE5] bg-white p-5 hover:border-[#176B4D]/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#F8FAF8] px-2 py-0.5 rounded border border-[#E3EAE5]">
                      {lot.lotReference}
                    </span>
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#EAF5EF] text-[#176B4D]">
                      {lot.category}
                    </span>
                    <StatusBadge status={lot.status} />
                    <span className="text-xs text-[#64736B]">
                      Listed {formatDate(lot.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#17251F]">
                    {lot.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
                    <span>
                      Available: <strong>{lot.availableQuantity} {lot.unitType}</strong>
                      {lot.soldQuantity !== undefined && <span> · Sold: {lot.soldQuantity}</span>}
                      {lot.reservedQuantity > 0 && (
                        <span className="text-[#B27318] ml-1">
                          ({lot.reservedQuantity} reserved in pending deals)
                        </span>
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      Public Asking: <strong>{lot.askingUnitPriceMinor ? formatPKR(lot.askingUnitPriceMinor) : 'Open for Offer'}</strong>
                    </span>
                    <span>•</span>
                    {lot.reserveUnitPriceMinor && (
                      <span className="flex items-center gap-1 text-[#176B4D] font-semibold bg-[#EAF5EF] px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3" />
                        Confidential Reserve: {formatPKR(lot.reserveUnitPriceMinor)}
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Expires: {formatDate(lot.expiryDate)} ({daysLeft}d left)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E3EAE5]">
                  <Link hidden={lot.status !== 'ACTIVE'} to={`/marketplace/${lot.id}`}>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Buyer View
                    </Button>
                  </Link>

                  {lot.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: lot.id, status: 'PAUSED' })}
                      className="text-xs"
                    >
                      <Pause className="w-3.5 h-3.5 mr-1" />
                      Pause
                    </Button>
                  )}

                  {(lot.status === 'PAUSED' || lot.status === 'DRAFT') && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: lot.id, status: 'ACTIVE' })}
                      className="text-xs font-semibold"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Publish / Resume
                    </Button>
                  )}

                  {import.meta.env.VITE_DATA_PROVIDER === 'mock' && lot.status !== 'CLOSED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Close this inventory listing?')) {
                          statusMutation.mutate({ id: lot.id, status: 'CLOSED' });
                        }
                      }}
                      className="text-xs text-[#C44E4E] hover:bg-[#FDF2F2]"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Close
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
