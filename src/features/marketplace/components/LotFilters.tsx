import type { LotFilters, ProductCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fromMinorUnits, toMinorUnits } from '@/lib/money';
import { Check, PackageCheck, RotateCcw, Search, ShieldCheck, X } from 'lucide-react';

interface LotFiltersProps {
  filters: LotFilters;
  onFilterChange: (newFilters: LotFilters) => void;
  onReset: () => void;
  activeFilterCount?: number;
  className?: string;
}

const CATEGORIES: { label: string; value: ProductCategory | 'ALL' }[] = [
  { label: 'All products', value: 'ALL' },
  { label: 'Biscuits', value: 'BISCUITS' },
  { label: 'Rusks & toast', value: 'RUSKS' },
  { label: 'Cakes', value: 'CAKES' },
  { label: 'Buns', value: 'BUNS' },
  { label: 'Pastries', value: 'PASTRIES' },
  { label: 'Packaged bread', value: 'PACKAGED_BREAD' },
];

const inputClass = 'h-10 rounded-xl border-[#E3EAE5] bg-white text-sm focus:border-[#176B4D] focus:ring-[#176B4D]';

export function LotFiltersComponent({ filters, onFilterChange, onReset, activeFilterCount = 0, className = '' }: LotFiltersProps) {
  const update = (patch: Partial<LotFilters>) => onFilterChange({ ...filters, ...patch });
  const priceInPkr = (minor?: number) => minor === undefined ? '' : fromMinorUnits(minor);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#176B4D]">Procurement filters</p>
          <h3 className="mt-1 text-base font-bold text-[#17251F]">Find stock you can actually buy</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#64736B]">Filter by commercial constraints, not just product type.</p>
        </div>
        {activeFilterCount > 0 && <span className="rounded-full bg-[#EAF5EF] px-2 py-1 text-[10px] font-bold text-[#176B4D]">{activeFilterCount} active</span>}
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#17251F]" htmlFor="lot-search">What are you sourcing?</label>
        <Input id="lot-search" className={inputClass} placeholder="Product, brand type, area or packaging" value={filters.search || ''} onChange={(event) => update({ search: event.target.value || undefined })} leftIcon={<Search className="h-4 w-4" />} />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#17251F]">Product category</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((category) => {
            const selected = (filters.category || 'ALL') === category.value;
            return <button key={category.value} type="button" onClick={() => update({ category: category.value })} className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${selected ? 'border-[#176B4D] bg-[#EAF5EF] text-[#176B4D]' : 'border-[#E3EAE5] bg-white text-[#64736B] hover:border-[#176B4D]/50'}`}><span className="flex items-center justify-between gap-2">{category.label}{selected && <Check className="h-3.5 w-3.5" />}</span></button>;
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-xs font-bold uppercase tracking-wider text-[#17251F]">Delivery / pickup city<select className={`w-full ${inputClass}`} value={filters.city || ''} onChange={(event) => update({ city: event.target.value || undefined })}><option value="">Any city</option><option value="Lahore">Lahore</option><option value="Karachi">Karachi</option><option value="Islamabad">Islamabad</option></select></label>
        <label className="space-y-2 text-xs font-bold uppercase tracking-wider text-[#17251F]">Stock availability<Input className={inputClass} type="number" min="1" step="25" placeholder="Minimum units" value={filters.minQuantity || ''} onChange={(event) => update({ minQuantity: event.target.value ? Number(event.target.value) : undefined })} /></label>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#17251F]">Unit price range (PKR)</p>
        <div className="grid grid-cols-2 gap-3"><Input className={inputClass} type="number" min="0" step="1" placeholder="From" value={priceInPkr(filters.minPriceMinor)} onChange={(event) => update({ minPriceMinor: event.target.value ? toMinorUnits(Number(event.target.value)) : undefined })} aria-label="Minimum unit price" /><Input className={inputClass} type="number" min="0" step="1" placeholder="To" value={priceInPkr(filters.maxPriceMinor)} onChange={(event) => update({ maxPriceMinor: event.target.value ? toMinorUnits(Number(event.target.value)) : undefined })} aria-label="Maximum unit price" /></div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-xs font-bold uppercase tracking-wider text-[#17251F]">Minimum shelf life<select className={`w-full ${inputClass}`} value={filters.minShelfLifeDays || ''} onChange={(event) => update({ minShelfLifeDays: event.target.value ? Number(event.target.value) : undefined })}><option value="">Any remaining life</option><option value="15">15+ days</option><option value="30">30+ days</option><option value="60">60+ days</option><option value="90">90+ days</option></select></label>
        <label className="space-y-2 text-xs font-bold uppercase tracking-wider text-[#17251F]">Packaging / handling<select className={`w-full ${inputClass}`} value={filters.packagingType || ''} onChange={(event) => update({ packagingType: event.target.value || undefined })}><option value="">Any packaging</option><option value="sealed">Sealed / retail-ready</option><option value="carton">Master carton</option><option value="ambient">Ambient storage</option><option value="chilled">Chilled storage</option></select></label>
      </div>

      <div className="space-y-3 border-t border-[#E3EAE5] pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#17251F]">Buying confidence</p>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#17251F]"><input type="checkbox" checked={Boolean(filters.verifiedOnly)} onChange={(event) => update({ verifiedOnly: event.target.checked })} className="h-4 w-4 rounded border-[#E3EAE5] text-[#176B4D] focus:ring-[#176B4D]" /><ShieldCheck className="h-4 w-4 text-[#176B4D]" /> Verified suppliers only</label>
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#17251F]"><input type="checkbox" checked={filters.status === 'PARTIALLY_SOLD'} onChange={(event) => update({ status: event.target.checked ? 'PARTIALLY_SOLD' : undefined })} className="h-4 w-4 rounded border-[#E3EAE5] text-[#176B4D] focus:ring-[#176B4D]" /><PackageCheck className="h-4 w-4 text-[#176B4D]" /> Only partially sold lots</label>
      </div>

      <div className="flex items-center gap-2 border-t border-[#E3EAE5] pt-4"><Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onReset}><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Clear filters</Button>{activeFilterCount > 0 && <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-xs font-semibold text-[#64736B] hover:text-[#17251F]"><X className="h-3.5 w-3.5" /> Reset</button>}</div>
    </div>
  );
}
