import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toMinorUnits, fromMinorUnits, formatPKR } from '@/lib/money';
import { offsetDays, formatDate } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Sparkles,
  Bot,
  PackagePlus,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
} from 'lucide-react';
import type { CreateLotInput, LotExtraction, ProductCategory, UnitType } from '@/types';

const SELLER_PROMPT_EXAMPLES = [
  'Have 200 sealed biscuit packs in Gulberg, minimum Rs. 110 each, expiry in 45 days.',
  'Surplus batch of 350 crispy tea rusks in Township, asking Rs. 130, reserve Rs. 115, expires in 60 days.',
  '120 boxes of butter cookies in Quaid-e-Azam Estate, asking Rs. 380, reserve Rs. 320, shelf-life 90 days.',
];

export function NewInventoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [aiText, setAiText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('BISCUITS');
  const [description, setDescription] = useState('');
  const [totalQuantity, setTotalQuantity] = useState<number>(200);
  const [unitType, setUnitType] = useState<UnitType>('cartons');
  const [askingPricePkr, setAskingPricePkr] = useState<number>(115);
  const [reservePricePkr, setReservePricePkr] = useState<number>(100);
  const [minPurchaseQty, setMinPurchaseQty] = useState<number>(25);
  const [packagingType, setPackagingType] = useState('Airtight moisture-barrier master carton packaging');
  const [expiryDays, setExpiryDays] = useState<number>(45);
  const [storageReq, setStorageReq] = useState('Dry ambient storage (18°C–24°C), relative humidity < 60%');
  const [city, setCity] = useState('Lahore');
  const [pickupRegion, setPickupRegion] = useState('Gulberg Industrial Area');
  const [resaleConfirmed, setResaleConfirmed] = useState(true);
  const [safetyConfirmed, setSafetyConfirmed] = useState(true);

  // AI Extraction Mutation
  const extractMutation = useMutation({
    mutationFn: (text: string) => api.parseSellerDescription(text),
    onSuccess: (data: LotExtraction) => {
      setTitle(data.title);
      setCategory(data.category);
      setTotalQuantity(data.total_quantity);
      setUnitType(data.unit_type);
      if (data.asking_unit_price_minor) {
        setAskingPricePkr(fromMinorUnits(data.asking_unit_price_minor));
      }
      if (data.reserve_unit_price_minor) {
        setReservePricePkr(fromMinorUnits(data.reserve_unit_price_minor));
      }
      setMinPurchaseQty(data.min_purchase_quantity);
      setPackagingType(data.packaging_type);
      setExpiryDays(data.expiry_days_from_now);
      setStorageReq(data.storage_requirements);
      setCity(data.city);
      setPickupRegion(data.pickup_region);
      setDescription(
        `Commercial surplus production batch of verified ${data.category.toLowerCase()} in sealed ${data.packaging_type}.`
      );
      toast.success('AI extracted structured inventory fields!', {
        description: 'Review the details below and configure your confidential reserve price.',
      });
    },
    onError: (err: Error) => {
      toast.error('AI parsing failed', { description: err.message });
    },
  });

  // Create Lot Mutation
  const createLotMutation = useMutation({
    mutationFn: (input: CreateLotInput) => api.createLot(input),
    onSuccess: (newLot) => {
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Surplus inventory lot published successfully!', {
        description: `Reference: ${newLot.lotReference}. Live on buyer marketplace.`,
      });
      navigate('/seller/inventory');
    },
    onError: (err: Error) => {
      toast.error('Failed to publish lot', { description: err.message });
    },
  });

  const handleRunAI = () => {
    if (!aiText.trim()) {
      toast.error('Please enter a description of your surplus stock.');
      return;
    }
    extractMutation.mutate(aiText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Product title is required.');
      return;
    }
    if (totalQuantity <= 0) {
      toast.error('Quantity must be greater than zero.');
      return;
    }
    if (!resaleConfirmed || !safetyConfirmed) {
      toast.error('Please confirm resale authorization and food-grade attestation.');
      return;
    }

    const payload: CreateLotInput = {
      title,
      category,
      description: description || `Overrun batch of sealed ${category.toLowerCase()}.`,
      totalQuantity,
      unitType,
      askingUnitPriceMinor: askingPricePkr ? toMinorUnits(askingPricePkr) : null,
      reserveUnitPriceMinor: reservePricePkr ? toMinorUnits(reservePricePkr) : undefined,
      minPurchaseQuantity: minPurchaseQty,
      packagingType,
      expiryDate: offsetDays(expiryDays),
      pickupDeadline: offsetDays(Math.max(7, expiryDays - 15)),
      storageRequirements: storageReq,
      city,
      pickupRegion,
      resalePermissionConfirmed: resaleConfirmed,
      safetyAttestationConfirmed: safetyConfirmed,
      images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'],
    };

    createLotMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E3EAE5]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
          <PackagePlus className="w-4 h-4" />
          Supplier Surplus Intake
        </div>
        <h1 className="text-2xl font-extrabold text-[#17251F]">
          List New Wholesale Surplus Inventory
        </h1>
        <p className="text-sm text-[#64736B] mt-1">
          Upload commercial bakery overrun batches. Set asking and confidential reserve prices with automatic buyer matching.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E3EAE5]">
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'border-b-2 border-[#176B4D] text-[#176B4D] bg-[#EAF5EF]/40'
              : 'text-[#64736B] hover:text-[#17251F]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E8A84B]" />
          Describe with AI Assistant
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'manual'
              ? 'border-b-2 border-[#176B4D] text-[#176B4D] bg-[#EAF5EF]/40'
              : 'text-[#64736B] hover:text-[#17251F]'
          }`}
        >
          Enter Manually
        </button>
      </div>

      {/* AI Assistant Box (Visible when on AI tab) */}
      {activeTab === 'ai' && (
        <div className="rounded-2xl border border-[#176B4D]/30 bg-[#EAF5EF]/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#176B4D]">
            <Bot className="w-4 h-4" />
            <span>AI Inventory Extractor</span>
          </div>
          <p className="text-xs text-[#17251F]/80">
            Paste your warehouse stock message or production log. SurplusLink AI extracts category, units, prices, and locations into the structured listing form below.
          </p>

          <Textarea
            rows={3}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="e.g. Have 200 sealed biscuit packs in Gulberg, minimum Rs. 110 each, expiry in 45 days."
          />

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-semibold text-[#64736B]">Try:</span>
            {SELLER_PROMPT_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAiText(ex)}
                className="text-[11px] bg-white border border-[#E3EAE5] px-2.5 py-1 rounded-lg text-[#17251F] hover:bg-[#EAF5EF] cursor-pointer"
              >
                "{ex}"
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleRunAI}
              isLoading={extractMutation.isPending}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E8A84B]" />
              Extract Fields to Form
            </Button>
          </div>
        </div>
      )}

      {/* Structured Confirmation Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E3EAE5] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-heading font-bold text-base text-[#17251F] pb-3 border-b border-[#E3EAE5]">
          Listing Details & Commercial Terms
        </h3>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
            Product Title / Batch Designation *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sealed Tea Biscuit Packs (Family 350g Master Cartons)"
            required
          />
        </div>

        {/* Category & Unit Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Product Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full h-10 rounded-xl border border-[#E3EAE5] bg-white px-3 text-sm text-[#17251F] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
            >
              <option value="BISCUITS">Biscuits</option>
              <option value="RUSKS">Rusks & Toast</option>
              <option value="COOKIES">Cookies</option>
              <option value="CRACKERS">Crackers</option>
              <option value="PACKAGED_BREAD">Packaged Bread</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Unit Type *
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as UnitType)}
              className="w-full h-10 rounded-xl border border-[#E3EAE5] bg-white px-3 text-sm text-[#17251F] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
            >
              <option value="packs">Packs</option>
              <option value="cartons">Cartons</option>
              <option value="boxes">Boxes</option>
              <option value="cases">Cases</option>
            </select>
          </div>
        </div>

        {/* Quantities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Total Available Batch Quantity *
            </label>
            <Input
              type="number"
              min="1"
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Minimum Purchase Quantity (Min Order) *
            </label>
            <Input
              type="number"
              min="1"
              max={totalQuantity}
              value={minPurchaseQty}
              onChange={(e) => setMinPurchaseQty(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>
        </div>

        {/* Pricing: Asking vs Confidential Reserve Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Public Asking Unit Price (PKR)
            </label>
            <Input
              type="number"
              min="0"
              value={askingPricePkr}
              onChange={(e) => setAskingPricePkr(parseFloat(e.target.value) || 0)}
              placeholder="Leave 0 for 'Submit Offer'"
            />
            <p className="mt-1 text-[11px] text-[#64736B]">
              Visible to buyers on public marketplace.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#176B4D]" />
              <span>Confidential Reserve Price (PKR)</span>
            </label>
            <Input
              type="number"
              min="0"
              value={reservePricePkr}
              onChange={(e) => setReservePricePkr(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 100"
            />
            <p className="mt-1 text-[11px] text-[#176B4D] font-medium">
              STRICTLY CONFIDENTIAL. Never exposed to buyers or public APIs.
            </p>
          </div>
        </div>

        {/* Packaging & Storage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Packaging Specification
            </label>
            <Input
              value={packagingType}
              onChange={(e) => setPackagingType(e.target.value)}
              placeholder="e.g. Airtight foil master cartons (24 units)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Storage Instructions
            </label>
            <Input
              value={storageReq}
              onChange={(e) => setStorageReq(e.target.value)}
              placeholder="e.g. Cool, dry ambient warehouse (18-24°C)"
            />
          </div>
        </div>

        {/* Expiry & Logistics Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Remaining Shelf-Life (Days) *
            </label>
            <Input
              type="number"
              min="5"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value, 10) || 0)}
              required
            />
            <p className="mt-1 text-[11px] text-[#64736B]">
              Calculates expiry: {formatDate(offsetDays(expiryDays))}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              City *
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              General District / Area *
            </label>
            <Input
              value={pickupRegion}
              onChange={(e) => setPickupRegion(e.target.value)}
              placeholder="e.g. Gulberg Industrial Area"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
            Surplus Lot Description & Background
          </label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe batch condition, reasons for surplus (export cancellation, seasonal overrun), loading dock availability..."
          />
        </div>

        {/* Resale and Safety Attestation Checkboxes */}
        <div className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] space-y-3">
          <label className="flex items-start gap-2.5 text-xs text-[#17251F] cursor-pointer">
            <input
              type="checkbox"
              checked={resaleConfirmed}
              onChange={(e) => setResaleConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#176B4D] focus:ring-[#176B4D]"
            />
            <span>
              <strong>Resale Authorization:</strong> I confirm our organization has legitimate commercial title and full authority to resell this sealed surplus inventory.
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-[#17251F] cursor-pointer">
            <input
              type="checkbox"
              checked={safetyConfirmed}
              onChange={(e) => setSafetyConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#176B4D] focus:ring-[#176B4D]"
            />
            <span>
              <strong>Food Safety & Compliance:</strong> I attest that this inventory has been kept in appropriate storage, remains sealed and uncompromised, and matches stated expiry specifications.
            </span>
          </label>
        </div>

        {/* Submit and Preview Actions */}
        <div className="pt-4 border-t border-[#E3EAE5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#64736B]">
            Platform commission of 2% is deducted strictly upon completed settlement.
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/seller/inventory')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createLotMutation.isPending}
              className="font-bold shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Publish Lot to Marketplace
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
