import { ApiError } from '@/components/shared/ApiError';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR, fromMinorUnits } from '@/lib/money';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Boxes,
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export function SellerAnalyticsPage() {
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'seller'],
    queryFn: () => api.getDashboard('seller'),
  });

  if (error) return <ApiError error={error} retry={refetch} />;

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const { metrics, chartData } = summary;

  // Format chart data for PKR display
  const formattedChartData = chartData.map((d) => ({
    ...d,
    volumePKR: fromMinorUnits(d.dealVolumeMinor),
    commissionPKR: fromMinorUnits(d.commissionMinor),
  }));

  const netProceedsMinor = metrics.sellerNetMinor;

  return (
    <div className="space-y-8">
      {metrics.platformRevenueMinor !== undefined && <div className="p-4 rounded-xl border bg-white"><strong>Platform simulated fees, all completed demo trades: {formatPKR(metrics.platformRevenueMinor)}</strong><p className="text-xs">Authorized backend metric. No real funds transferred.</p></div>}
      {/* Header */}
      <div className="pb-6 border-b border-[#E3EAE5]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
          <LineChart className="w-4 h-4" />
          Financial & Inventory Clearance Analytics
        </div>
        <h1 className="text-2xl font-extrabold text-[#17251F]">
          Seller Performance & Commission Reporting
        </h1>
        <p className="text-sm text-[#64736B] mt-1">
          Monitor your organization's surplus asset turnover, negotiated wholesale pricing, and transparent 2% platform commission deductions.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Completed Wholesale Volume
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {formatPKR(metrics.completedDealValueMinor)}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Gross accepted deal value</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Seller Success Fee (2%)
          </div>
          <div className="text-2xl font-extrabold text-[#C44E4E]">
            {formatPKR(metrics.platformFeesMinor)}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Platform service fee</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Net Supplier Proceeds
          </div>
          <div className="text-2xl font-extrabold text-[#176B4D]">
            {netProceedsMinor === undefined ? 'Not provided' : formatPKR(netProceedsMinor)}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Gross volume minus fee</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Conversion Rate
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.unitsListed && metrics.unitsListed > 0
              ? `${Math.round((metrics.acceptedDeals / (metrics.activeLots || 1)) * 100)}%`
              : '—'}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Listings converted to deals</p>
        </div>
      </div>

      {/* Visual Charts */}
      {chartData.length === 0 && <p className="text-sm text-[#64736B]">Historical chart data is not provided by this backend. Summary metrics above are current.</p>}
      <div hidden={chartData.length === 0} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deal Volume Bar Chart */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#17251F]">
              Gross Wholesale Deal Volume (PKR)
            </h3>
            <span className="text-xs text-[#64736B]">Simulated Trends</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE5" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64736B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64736B' }}
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E3EAE5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="volumePKR" fill="#176B4D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commission Deductions Area Chart */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#17251F]">
              2% Platform Commission Recorded (PKR)
            </h3>
            <span className="text-xs text-[#64736B]">Success-Fee Model</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChartData}>
                <defs>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A84B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E8A84B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE5" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64736B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64736B' }}
                  tickFormatter={(val) => `Rs.${val}`}
                />
                <Tooltip
                  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Commission']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E3EAE5',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="commissionPKR"
                  stroke="#B27318"
                  fillOpacity={1}
                  fill="url(#colorCommission)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] flex items-start gap-3 text-xs text-[#64736B]">
        <Info className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Settlement Transparency:</strong> SurplusLink AI charges a 2% seller commission solely upon confirmed physical goods handover. Simulated test transactions in this prototype demonstrate platform metrics without representing actual transferred funds.
        </p>
      </div>
    </div>
  );
}
