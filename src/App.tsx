import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { ErrorState, LoadingSkeleton } from './components/ui/StateFeedback';
import { AlertsPage, type DateRangeFilter } from './pages/AlertsPage';
import { EnvironmentalDataPage } from './pages/EnvironmentalDataPage';
import { OverviewPage } from './pages/OverviewPage';
import { VillageDetailPage } from './pages/VillageDetailPage';
import {
  buildOverviewSummary,
  fetchAlerts,
  fetchVillages,
  updateAlertStatus,
} from './services/api';
import type { AlertItem, AlertStatus, PageId, RiskLevel, Village } from './types/village';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [villages, setVillages] = useState<Village[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('kothri');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Alerts page filter state
  const [alertVillageFilter, setAlertVillageFilter] = useState<string>('all');
  const [alertRiskFilter, setAlertRiskFilter] = useState<'All' | RiskLevel>('All');
  const [alertDateFilter, setAlertDateFilter] = useState<DateRangeFilter>('all');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [villagesRes, alertsRes] = await Promise.all([
        fetchVillages(),
        fetchAlerts(),
      ]);
      setVillages(villagesRes);
      setAlerts(alertsRes);
      if (villagesRes.length > 0) {
        setSelectedVillageId((prev) =>
          villagesRes.some((v) => v.id === prev) ? prev : villagesRes[0].id
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred while loading data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const summary = useMemo(() => buildOverviewSummary(villages), [villages]);

  const selectedVillage = useMemo(
    () => villages.find((v) => v.id === selectedVillageId),
    [villages, selectedVillageId]
  );

  const newAlertsCount = useMemo(
    () => alerts.filter((a) => a.status === 'New').length,
    [alerts]
  );

  const handleOpenVillageDetail = useCallback((villageId: string) => {
    setSelectedVillageId(villageId);
    setActivePage('village-detail');
  }, []);

  const handleReviewHighRiskAlerts = useCallback(() => {
    setAlertVillageFilter('all');
    setAlertRiskFilter('High');
    setAlertDateFilter('all');
    setActivePage('alerts');
  }, []);

  const handleSeeVillageAlerts = useCallback((villageId: string) => {
    setAlertVillageFilter(villageId);
    setAlertRiskFilter('All');
    setAlertDateFilter('all');
    setActivePage('alerts');
  }, []);

  const handleClearAlertFilters = useCallback(() => {
    setAlertVillageFilter('all');
    setAlertRiskFilter('All');
    setAlertDateFilter('all');
    setSearchQuery('');
  }, []);

  const handleUpdateAlertStatus = useCallback(
    async (alertId: string, status: AlertStatus) => {
      try {
        const updated = await updateAlertStatus(alertId, status);
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      } catch {
        // Keep UI resilient if status update fails
      }
    },
    []
  );

  return (
    <Layout
      activePage={activePage}
      onNavigate={setActivePage}
      villages={villages}
      selectedVillageId={selectedVillageId}
      onSelectVillage={setSelectedVillageId}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      newAlertsCount={newAlertsCount}
      highRiskVillages={summary.highRiskVillages}
      onReviewHighRiskAlerts={handleReviewHighRiskAlerts}
    >
      {loading ? (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <LoadingSkeleton />
        </div>
      ) : error ? (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <ErrorState message={error} onRetry={loadDashboardData} />
        </div>
      ) : activePage === 'overview' ? (
        <OverviewPage
          summary={summary}
          villages={villages}
          alerts={alerts}
          selectedVillageId={selectedVillageId}
          onSelectVillage={setSelectedVillageId}
          onOpenVillageDetail={handleOpenVillageDetail}
          onViewAllAlerts={() => setActivePage('alerts')}
        />
      ) : activePage === 'village-detail' ? (
        <VillageDetailPage
          villages={villages}
          village={selectedVillage}
          onSelectVillage={setSelectedVillageId}
          onBackToOverview={() => setActivePage('overview')}
          onSeeVillageAlerts={handleSeeVillageAlerts}
        />
      ) : activePage === 'alerts' ? (
        <AlertsPage
          alerts={alerts}
          villages={villages}
          searchQuery={searchQuery}
          villageFilter={alertVillageFilter}
          riskFilter={alertRiskFilter}
          dateFilter={alertDateFilter}
          onVillageFilterChange={setAlertVillageFilter}
          onRiskFilterChange={setAlertRiskFilter}
          onDateFilterChange={setAlertDateFilter}
          onClearFilters={handleClearAlertFilters}
          onUpdateStatus={handleUpdateAlertStatus}
          onOpenVillageDetail={handleOpenVillageDetail}
        />
      ) : (
        <EnvironmentalDataPage
          villages={villages}
          village={selectedVillage}
          onSelectVillage={setSelectedVillageId}
        />
      )}
    </Layout>
  );
}

export default App;
