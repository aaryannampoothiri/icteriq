import {
  AlertTriangle,
  Bell,
  CloudRain,
  LayoutGrid,
  MapPin,
  Menu,
  Search,
  Shield,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PageId, Village } from '../types/village';

interface LayoutProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  villages: Village[];
  selectedVillageId: string;
  onSelectVillage: (villageId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  newAlertsCount: number;
  highRiskVillages: Village[];
  onReviewHighRiskAlerts: () => void;
  children: ReactNode;
}

const NAV_ITEMS: { id: PageId; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'village-detail', label: 'Village detail', icon: MapPin },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'environmental', label: 'Environmental data', icon: CloudRain },
];

export function Layout({
  activePage,
  onNavigate,
  villages,
  selectedVillageId,
  onSelectVillage,
  searchQuery,
  onSearchChange,
  newAlertsCount,
  highRiskVillages,
  onReviewHighRiskAlerts,
  children,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchFocused(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const matchingVillages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return villages.filter((v) => v.name.toLowerCase().includes(q)).slice(0, 6);
  }, [villages, searchQuery]);

  const highRiskNamesSummary = useMemo(() => {
    if (highRiskVillages.length === 0) return '';
    const names = highRiskVillages.map((v) => v.name);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  }, [highRiskVillages]);

  const showGlobalHighRiskBanner =
    highRiskVillages.length > 0 && !bannerDismissed && activePage === 'overview';

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Shield className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight text-slate-900">
              VillageGuard
            </div>
            <div className="text-[11px] leading-tight text-slate-500">
              Dengue early warning
            </div>
          </div>
        </div>

        <nav className="space-y-1 p-3" aria-label="Primary navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </span>
                {id === 'alerts' && newAlertsCount > 0 && (
                  <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">
                    {newAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="px-1 text-xs leading-relaxed text-slate-500">
          <span className="font-medium text-slate-700">Ernakulam District</span>
          <br />
          Surveillance feed · Week 48
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex h-full w-64 max-w-[80vw] flex-col border-r border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3.5 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search input */}
            <div ref={searchWrapperRef} className="relative w-full max-w-xs sm:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder={
                  activePage === 'alerts'
                    ? 'Search alerts or villages...'
                    : 'Search villages...'
                }
                aria-label="Search villages or alerts"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
              />

              {/* Quick-jump dropdown when searching outside Alerts */}
              {searchFocused &&
                activePage !== 'alerts' &&
                searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-lg border border-slate-200 bg-white py-1 shadow-md">
                    {matchingVillages.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-500">
                        No villages matching &ldquo;{searchQuery}&rdquo;
                      </div>
                    ) : (
                      matchingVillages.map((village) => (
                        <button
                          key={village.id}
                          type="button"
                          onClick={() => {
                            onSelectVillage(village.id);
                            onNavigate('village-detail');
                            setSearchFocused(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-900">
                            {village.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {village.riskLevel} · {village.riskScore}/100
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
            </div>

            {/* Village selector */}
            <div className="hidden sm:block">
              <label htmlFor="topbar-village-select" className="sr-only">
                Select village
              </label>
              <select
                id="topbar-village-select"
                value={selectedVillageId}
                onChange={(e) => {
                  onSelectVillage(e.target.value);
                  if (activePage === 'overview') {
                    onNavigate('village-detail');
                  }
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700 focus:border-teal-600 focus:outline-none"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.riskLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white"
                aria-hidden="true"
              >
                DH
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold leading-tight text-slate-900">
                  District Health Officer
                </div>
                <div className="text-[11px] leading-tight text-slate-500">
                  Ernakulam district
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {showGlobalHighRiskBanner && (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-3 rounded-md border border-red-200 border-l-4 border-l-red-600 bg-red-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 sm:items-center">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-600 sm:mt-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    {highRiskVillages.length}{' '}
                    {highRiskVillages.length === 1 ? 'village is' : 'villages are'} at
                    High risk
                  </p>
                  <p className="text-xs text-red-800 sm:text-sm">
                    {highRiskNamesSummary} need preventive action this week.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={onReviewHighRiskAlerts}
                  className="rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 sm:text-sm"
                >
                  Review alerts
                </button>
                <button
                  type="button"
                  onClick={() => setBannerDismissed(true)}
                  className="rounded-md p-1 text-red-700 hover:bg-red-100"
                  aria-label="Dismiss high risk banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

