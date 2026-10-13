import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BellRing, 
  BarChart3, 
  Flag, 
  LifeBuoy, 
  Info, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Radio,
  History,
  Database,
  ShieldCheck
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'historical'
  | 'map'
  | 'alerts'
  | 'risk'
  | 'india'
  | 'resources'
  | 'audit'
  | 'sources'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  unreadCount = 0,
  criticalCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Live Monitoring Center',
      icon: LayoutDashboard,
      badge: criticalCount > 0 ? `${criticalCount} Critical` : undefined,
      badgeColor: 'bg-red-950/60 text-red-300 border border-red-800/80',
    },
    {
      id: 'historical' as ActiveTab,
      label: 'Historical Intelligence',
      icon: History,
      badge: 'Archive DB',
      badgeColor: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/80',
    },
    {
      id: 'map' as ActiveTab,
      label: 'Global Geospatial Map',
      icon: MapIcon,
    },
    {
      id: 'alerts' as ActiveTab,
      label: 'Critical Alert Engine',
      icon: BellRing,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
      badgeColor: 'bg-blue-950/60 text-blue-300 border border-blue-800/80',
    },
    {
      id: 'risk' as ActiveTab,
      label: 'Risk Analytics Model',
      icon: BarChart3,
    },
    {
      id: 'india' as ActiveTab,
      label: 'India Sector Mode',
      icon: Flag,
      badge: 'National Grid',
      badgeColor: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80',
    },
    {
      id: 'resources' as ActiveTab,
      label: 'Emergency Directory',
      icon: LifeBuoy,
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Data Accuracy Audit',
      icon: ShieldCheck,
      badge: 'Audited',
      badgeColor: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80',
    },
    {
      id: 'sources' as ActiveTab,
      label: 'Data Provenance & Sync',
      icon: Database,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'System Configuration',
      icon: Settings,
    },
  ];

  return (
    <aside 
      className={`relative z-30 flex flex-col bg-[#050b1a]/85 backdrop-blur-md border-r border-cyan-900/30 transition-all duration-300 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-glow-blue'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-blue-900/20 bg-[#040812]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900/40 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="font-mono text-[11px]">COLLAPSE PANEL</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
