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

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#163300]">
      {/* Top Horizontal Navigation Bar (Wise-style) */}
      <header className="sticky top-0 z-30 border-b border-[#e2e7df] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left: Brand + Horizontal Nav Pills */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavClick('overview')}
              className="flex items-center gap-2 text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#163300] text-[#9FE870]">
                <Shield className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight text-[#163300]">
                VillageGuard
              </span>
            </button>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
              {NAV_ITEMS.map(({ id, label }) => {
                const isActive = activePage === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleNavClick(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#9FE870] text-[#163300]'
                        : 'text-[#163300] hover:bg-[#f2f5f0]'
                    }`}
                  >
                    <span>{label}</span>
                    {id === 'alerts' && newAlertsCount > 0 && (
                      <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                        {newAlertsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search + Village Select + Profile + Mobile Menu */}
          <div className="flex items-center gap-2.5">
            <div ref={searchWrapperRef} className="relative hidden w-56 sm:block lg:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b54]"
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
                    ? 'Search alerts...'
                    : 'Search villages...'
                }
                aria-label="Search villages or alerts"
                className="h-9 w-full rounded-full border border-[#d4dbd0] bg-[#f4f6f3] pl-9 pr-3 text-sm text-[#163300] placeholder:text-[#5c6b54] focus:border-[#163300] focus:bg-white focus:outline-none"
              />

              {searchFocused &&
                activePage !== 'alerts' &&
                searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1.5 rounded-2xl border border-[#d4dbd0] bg-white py-1.5 shadow-md">
                    {matchingVillages.length === 0 ? (
                      <div className="px-4 py-2 text-xs text-[#5c6b54]">
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
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-[#45553d] hover:bg-[#f4f6f3]"
                        >
                          <span className="font-semibold text-[#163300]">
                            {village.name}
                          </span>
                          <span className="text-xs text-[#5c6b54]">
                            {village.riskLevel} · {village.riskScore}/100
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
            </div>

            <div className="hidden md:block">
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
                className="h-9 rounded-full border border-[#d4dbd0] bg-white px-3 text-xs font-semibold text-[#163300] focus:border-[#163300] focus:outline-none"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.riskLevel})
                  </option>
                ))}
              </select>
            </div>

            <div
              className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#163300] text-xs font-bold text-[#9FE870] sm:flex"
              title="District Health Officer · Kothri 100 km Zone (MP)"
            >
              DH
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full border border-[#d4dbd0] p-2 text-[#163300] hover:bg-[#f4f6f3] lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-[#e2e7df] bg-white px-4 py-3 lg:hidden">
            <div className="mb-3 sm:hidden">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search villages or alerts..."
                aria-label="Search villages or alerts"
                className="h-9 w-full rounded-full border border-[#d4dbd0] bg-[#f4f6f3] px-4 text-sm text-[#163300]"
              />
            </div>
            <nav className="flex flex-wrap gap-1.5" aria-label="Mobile navigation">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = activePage === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleNavClick(id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ${
                      isActive
                        ? 'bg-[#9FE870] text-[#163300]'
                        : 'bg-[#f4f6f3] text-[#163300]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{label}</span>
                    {id === 'alerts' && newAlertsCount > 0 && (
                      <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {newAlertsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Global High-risk alert bar */}
      {showGlobalHighRiskBanner && (
        <div role="alert" className="border-b border-red-200 bg-red-50">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3 sm:items-center">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600 sm:mt-0"
                aria-hidden="true"
              />
              <p className="text-xs text-red-950 sm:text-sm">
                <strong className="font-bold">
                  {highRiskVillages.length}{' '}
                  {highRiskVillages.length === 1 ? 'village is' : 'villages are'} at High risk:
                </strong>{' '}
                {highRiskNamesSummary} need preventive action this week.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onReviewHighRiskAlerts}
                className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
              >
                Review alerts
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="rounded-full p-1 text-red-700 hover:bg-red-100"
                aria-label="Dismiss high risk banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-bleed page content */}
      <main className="flex-1">{children}</main>

      {/* Clean Wise-style footer */}
      <footer className="border-t border-[#e2e7df] bg-[#f4f6f3] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#163300] text-[#9FE870]">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="text-xs text-[#5c6b54]">
              <strong className="font-semibold text-[#163300]">VillageGuard</strong> ·
              Kothri 100 km Zone (MP) · Jaundice Surveillance · Week 48
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#163300]">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                className="hover:underline"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
