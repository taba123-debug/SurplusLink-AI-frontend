import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toMinorUnits, fromMinorUnits, formatPKR } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LotCard } from '@/features/marketplace/components/LotCard';
import { EmptyState } from '@/components/ui/emptyState';
import { toast } from 'sonner';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sliders,
  Tag,
  Boxes,
  Calendar,
  MapPin,
  BookmarkPlus,
} from 'lucide-react';
import type { MatchResult, ProductCategory, RequirementExtraction } from '@/types';

const PROMPT_CHIPS = [
  'I need 150 sealed biscuit packs under Rs. 20,000 in Lahore, with at least 30 days of shelf life remaining.',
  '100 biscuit packs under Rs. 15,000 in Gulberg',
  'Wholesale rusks with 30+ days shelf life in Township',
  'Sealed cakes available near Johar Town under Rs. 30,000',
  '300 sealed pastries for bulk redistribution',
];

export function AISourcingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Step state: 'input' | 'review' | 'results'
  const [step, setStep] = useState<'input' | 'review' | 'results'>('input');
  const [promptText, setPromptText] = useState('');
  const [extractedData, setExtractedData] = useState<RequirementExtraction | null>(null);

  // Editable confirmation form state
  const [unit, setUnit] = useState('pack');
  const [category, setCategory] = useState<ProductCategory>('BISCUITS');
  const [quantity, setQuantity] = useState<number>(150);
  const [budgetPkr, setBudgetPkr] = useState<number>(20000);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(30);
  const [city, setCity] = useState<string>('Lahore');
  const [preferredArea, setPreferredArea] = useState<string>('');
  const [pickupPreference, setPickupPreference] = useState<string>('Self-pickup via buyer vehicle');

  // Match results state
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [savedReqId, setSavedReqId] = useState<string | null>(null);

  // AI Extraction Mutation
  const extractMutation = useMutation({
    mutationFn: (text: string) => api.parseBuyerRequirement(text),
    onSuccess: (data) => {
      setExtractedData(data);
      setUnit(data.unit || '');
      setCategory(data.category);
      setQuantity(data.required_quantity);
      setBudgetPkr(fromMinorUnits(data.max_total_budget_minor));
      setShelfLifeDays(data.min_remaining_shelf_life_days);
      setCity(data.city);
      setPreferredArea(data.preferred_area || '');
      setStep('review');
      toast.success('AI parsed requirement successfully!', {
        description: 'Please review and verify the structured fields before running matches.',
      });
    },
    onError: (err: Error) => {
      toast.error('AI parsing failed', { description: err.message });
    },
  });

  // Save Requirement & Run Matching Mutation
  const saveAndMatchMutation = useMutation({
    mutationFn: async () => {
      if (!category || !unit || quantity <= 0 || budgetPkr <= 0 || shelfLifeDays < 0 || !city.trim()) throw new Error('Review category, unit, quantity, budget, shelf life and city before saving.');
      // 1. Create requirement in store
      const reqTitle = `${quantity} ${category.toLowerCase()} requirement in ${city}`;
      const saved = await api.createRequirement({
        title: reqTitle,
        originalDescription: promptText,
        unit,
        category,
        requiredQuantity: quantity,
        maxTotalBudgetMinor: toMinorUnits(budgetPkr),
        minRemainingShelfLifeDays: shelfLifeDays,
        city,
        preferredArea: preferredArea || undefined,
        pickupPreference,
      });

      // 2. Fetch matches for this requirement
      const matchResults = await api.getRequirementMatches(saved.id);
      return { saved, matchResults };
    },
    onSuccess: ({ saved, matchResults }) => {
      setSavedReqId(saved.id);
      setMatches(matchResults);
      setStep('results');
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success(`Found ${matchResults.length} compatible wholesale batches!`);
    },
    onError: (err: Error) => {
      toast.error('Matching failed', { description: err.message });
    },
  });

  const handleRunAI = () => {
    if (!promptText.trim()) {
      toast.error('Please enter a description of your inventory requirements.');
      return;
    }
    extractMutation.mutate(promptText);
  };

  const handleChipClick = (chip: string) => {
    setPromptText(chip);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Mission */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EF] text-[#176B4D] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#E8A84B]" />
          SurplusLink AI Sourcing Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17251F] tracking-tight">
          Tell us what your business needs.
        </h1>
        <p className="text-sm text-[#64736B] leading-relaxed">
          Describe your inventory needs in everyday language. SurplusLink AI turns them into searchable requirements and helps find compatible wholesale lots across Pakistan.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-center gap-3 text-xs font-semibold">
        <button
          onClick={() => setStep('input')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            step === 'input'
              ? 'bg-[#176B4D] text-white'
              : 'bg-white border border-[#E3EAE5] text-[#64736B]'
          }`}
        >
          <span>1. Natural Language</span>
        </button>
        <span className="text-[#CBD5E1]">→</span>
        <button
          onClick={() => extractedData && setStep('review')}
          disabled={!extractedData}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            step === 'review'
              ? 'bg-[#176B4D] text-white'
              : 'bg-white border border-[#E3EAE5] text-[#64736B] disabled:opacity-50'
          }`}
        >
          <span>2. Structured Verification</span>
        </button>
        <span className="text-[#CBD5E1]">→</span>
        <button
          onClick={() => matches.length > 0 && setStep('results')}
          disabled={matches.length === 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
            step === 'results'
              ? 'bg-[#176B4D] text-white'
              : 'bg-white border border-[#E3EAE5] text-[#64736B] disabled:opacity-50'
          }`}
        >
          <span>3. Compatible Matches ({matches.length})</span>
        </button>
      </div>

      {/* STEP 1: Natural Language Input */}
      {step === 'input' && (
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#17251F]" htmlFor="field-AISourcingPage-1">
              Describe your procurement request
            </label>
              <Textarea id="field-AISourcingPage-1"
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. I need 150 sealed biscuit packs under Rs. 20,000 in Lahore, with at least 30 days of shelf life remaining."
              className="text-base"
            />
          </div>

          {/* Prompt Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#64736B]">
              Try one of these example procurement prompts:
            </span>
            <div className="flex flex-wrap gap-2">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="text-xs bg-[#F8FAF8] hover:bg-[#EAF5EF] hover:text-[#176B4D] border border-[#E3EAE5] px-3 py-1.5 rounded-xl transition-colors text-left cursor-pointer"
                >
                  "{chip}"
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" onClick={() => { setExtractedData({ category: 'BISCUITS', required_quantity: 150, max_total_budget_minor: 2000000, min_remaining_shelf_life_days: 30, city: 'Lahore', preferred_area: null, needs_review: true, missing_fields: ['Manual entry — no AI inference'] }); setUnit('pack'); setStep('review'); }}>Enter requirement manually</Button>
          {extractMutation.isError && <p role="alert" className="text-sm text-red-700">{extractMutation.error.message}</p>}
          {/* Action */}
          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleRunAI}
              isLoading={extractMutation.isPending}
            >
              <Sparkles className="w-4 h-4 text-[#E8A84B]" />
              Extract & Find Matching Stock
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Structured Review & Confirmation */}
      {step === 'review' && extractedData && (
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3EAE5]">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#176B4D]">
                <Bot className="w-4 h-4" />
                {extractedData.missing_fields.includes('Manual entry — no AI inference') ? 'Manual Requirement Review' : 'Live AI Extraction Review'}
              </div>
              <h2 className="text-xl font-bold text-[#17251F] mt-1">
                Confirm Structured Requirements
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('input')}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Edit Prompt
            </Button>
          </div>

          {extractedData.needs_review && (
            <div className="p-3.5 rounded-xl bg-[#FEF8EC] border border-[#E8A84B]/30 flex items-start gap-2 text-xs text-[#B27318]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> Some details could not be inferred with complete confidence. Please verify all fields below. Missing fields: {extractedData.missing_fields.join(', ') || 'none'}.
              </div>
            </div>
          )}

          {/* Editable Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-AISourcingPage-2">
                Product Category
              </label>
              <select id="field-AISourcingPage-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full h-10 rounded-xl border border-[#E3EAE5] bg-white px-3 text-sm text-[#17251F] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
              >
                <option value="">Select category</option><option value="BISCUITS">Biscuits</option>
                <option value="RUSKS">Rusks & Toast</option>
                <option value="CAKES">Cakes</option>
                <option value="PASTRIES">Pastries</option><option value="BUNS">Buns</option>
                <option value="PACKAGED_BREAD">Packaged Bread</option>
              </select>
            </div>

            <div><label htmlFor="requirement-unit" className="block text-xs font-bold mb-2">Unit</label><select id="requirement-unit" value={unit} onChange={e => setUnit(e.target.value)} className="w-full h-10 border rounded-xl px-3"><option value="">Select unit</option><option value="pack">Pack</option><option value="carton">Carton</option><option value="tray">Tray</option><option value="piece">Piece</option></select></div>
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-AISourcingPage-3">
                Requested Quantity (Units)
              </label>
              <Input id="field-AISourcingPage-3"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            {/* Total Budget */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-AISourcingPage-4">
                Maximum Total Budget (PKR)
              </label>
              <Input id="field-AISourcingPage-4"
                type="number"
                min="1000"
                step="500"
                value={budgetPkr}
                onChange={(e) => setBudgetPkr(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            {/* Minimum Shelf Life */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-AISourcingPage-5">
                Minimum Shelf-Life (Days)
              </label>
              <Input id="field-AISourcingPage-5"
                type="number"
                min="5"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-AISourcingPage-6">
                City / Province
              </label>
              <Input id="field-AISourcingPage-6"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Preferred Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-AISourcingPage-7">
                Preferred Area / District
              </label>
              <Input id="field-AISourcingPage-7"
                value={preferredArea}
                placeholder="e.g. Johar Town, Gulberg, Township"
                onChange={(e) => setPreferredArea(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E3EAE5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#64736B]">
              Saving this requirement enables automatic two-way matching when sellers list new inventory.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => saveAndMatchMutation.mutate()}
                isLoading={saveAndMatchMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Confirm & Find Matches
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Matching Results */}
      {step === 'results' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E3EAE5] shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#176B4D]">
                <Sparkles className="w-4 h-4 text-[#E8A84B]" />
                Compatibility Results
              </div>
              <h2 className="text-xl font-bold text-[#17251F] mt-0.5">
                Matching Lots for: {quantity} {category} in {city}
              </h2>
              <p className="text-xs text-[#64736B]">
                Budget: Up to {formatPKR(toMinorUnits(budgetPkr))} • Min {shelfLifeDays} days shelf-life
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('review')}
                className="text-xs"
              >
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                Modify Criteria
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/buyer/requirements')}
                className="text-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                View All Saved Requirements
              </Button>
            </div>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              title="No Exact Matches Found"
              description="No compatible batches currently meet these criteria. Your requirement is saved; check matches again after new stock is published."
              actionLabel="Adjust Criteria"
              onAction={() => setStep('review')}
              secondaryActionLabel="Explore All Lots"
              onSecondaryAction={() => navigate('/marketplace')}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(({ lot, compatibilityScore, matchReasons, budgetCompatibility }) => (
                  <LotCard
                    requirementId={savedReqId || undefined}
                    requiredQuantity={quantity}
                    key={lot.id}
                    lot={lot}
                    matchScore={compatibilityScore}
                    matchReasons={matchReasons}
                    budgetCompatibility={budgetCompatibility}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
