import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#17251F]">
      <TopNavbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Subtle subheader bar with collapse toggle */}
          <div className="h-10 px-4 sm:px-6 border-b border-[#E3EAE5] bg-white flex items-center justify-between text-xs text-[#64736B]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex items-center gap-1.5 text-[#64736B] hover:text-[#17251F] cursor-pointer"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                <span className="text-[11px] font-medium">{collapsed ? 'Expand' : 'Collapse'}</span>
              </button>
              <span className="hidden md:inline text-[#E3EAE5]">|</span>
              <span className="text-[11px]">B2B Wholesale Procurement Portal</span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1 text-[#176B4D] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B4D]" />
                Live Demo Sync
              </span>
            </div>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
