import React from 'react';
import type { LotFilters, ProductCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Filter, ShieldCheck, Search } from 'lucide-react';

interface LotFiltersProps {
  filters: LotFilters;
  onFilterChange: (newFilters: LotFilters) => void;
  onReset: () => void;
  className?: string;
}

const CATEGORIES: { label: string; value: ProductCategory | 'ALL' }[] = [
  { label: 'All Bakery Surplus', value: 'ALL' },
  { label: 'Biscuits', value: 'BISCUITS' },
  { label: 'Rusks & Toast', value: 'RUSKS' },
  { label: 'Cakes', value: 'CAKES' },
  { label: 'Buns', value: 'BUNS' },
  { label: 'Pastries', value: 'PASTRIES' },
  { label: 'Packaged Bread', value: 'PACKAGED_BREAD' },
];

export function LotFiltersComponent({
  filters,
  onFilterChange,
  onReset,
  className = '',
}: LotFiltersProps) {
  const update = (patch: Partial<LotFilters>) => {
    onFilterChange({ ...filters, ...patch });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header for mobile/desktop filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-2" htmlFor="field-LotFilters-1">
          Search Lots
        </label>
              <Input id="field-LotFilters-1"
          placeholder="Filter by product, batch, area..."
          value={filters.search || ''}
          onChange={(e) => update({ search: e.target.value })}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-2.5" htmlFor="field-LotFilters-2">
          Product Category
        </label>
        <div className="flex flex-col space-y-1">
          {CATEGORIES.map((c) => {
            const isSelected = (filters.category || 'ALL') === c.value;
            return (
              <button
                key={c.value}
                onClick={() => update({ category: c.value })}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#176B4D] text-white font-semibold'
                    : 'text-[#17251F] hover:bg-[#EAF5EF]/60'
                }`}
              >
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* City & Area */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-2">
          Location / City
        </label>
              <select id="field-LotFilters-2"
          value={filters.city || ''}
          onChange={(e) => update({ city: e.target.value || undefined })}
          className="w-full h-10 rounded-xl border border-[#E3EAE5] bg-white px-3 text-xs text-[#17251F] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
        >
          <option value="">All Regions (Pakistan)</option>
          <option value="Lahore">Lahore Only</option>
          <option value="Karachi">Karachi</option>
          <option value="Islamabad">Islamabad</option>
        </select>
      </div>

      {/* Minimum Available Quantity */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-2" htmlFor="field-LotFilters-3">
          Minimum Batch Quantity
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            step="25"
            placeholder="e.g. 50"
            value={filters.minQuantity || ''}
            onChange={(e) =>
              update({ minQuantity: e.target.value ? parseInt(e.target.value, 10) : undefined })
            }
          />
        </div>
      </div>

      {/* Minimum Shelf-Life (Days) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-2">
          Remaining Shelf Life
        </label>
              <select id="field-LotFilters-3"
          value={filters.minShelfLifeDays || ''}
          onChange={(e) =>
            update({
              minShelfLifeDays: e.target.value ? parseInt(e.target.value, 10) : undefined,
            })
          }
          className="w-full h-10 rounded-xl border border-[#E3EAE5] bg-white px-3 text-xs text-[#17251F] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
        >
          <option value="">Any Shelf Life</option>
          <option value="15">At least 15 Days</option>
          <option value="30">At least 30 Days</option>
          <option value="60">At least 60 Days</option>
          <option value="90">At least 90 Days</option>
        </select>
      </div>

      {/* Verified Supplier Only Toggle */}
      <div className="pt-2 border-t border-[#E3EAE5]">
        <label className="flex items-center gap-2.5 text-xs font-medium text-[#17251F] cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.verifiedOnly}
            onChange={(e) => update({ verifiedOnly: e.target.checked })}
            className="w-4 h-4 rounded text-[#176B4D] focus:ring-[#176B4D] border-[#E3EAE5]"
          />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B4D]" />
            Verified Suppliers Only
          </span>
        </label>
      </div>

      {/* Reset Action */}
      <div className="pt-3 border-t border-[#E3EAE5]">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs text-[#64736B] hover:text-[#17251F]"
          onClick={onReset}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}
