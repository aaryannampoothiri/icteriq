import alertsData from '../data/alerts.json';
import villagesData from '../data/villages.json';
import type { AlertItem, AlertStatus, OverviewSummary, Village } from '../types/village';

/**
 * Data access layer for VillageGuard.
 *
 * Currently backed by local JSON fixtures so the frontend runs standalone.
 * To connect a Python backend (e.g., FastAPI/Flask), set VITE_API_BASE_URL
 * in `.env` and switch `USE_MOCK_DATA` to `false`.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const USE_MOCK_DATA = !import.meta.env.VITE_API_BASE_URL;

// In-memory store for mock mutations (e.g., alert status updates)
let mockAlertsStore: AlertItem[] = alertsData as AlertItem[];
const mockVillagesStore: Village[] = villagesData as Village[];

function simulateLatency(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status}): ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function fetchVillages(): Promise<Village[]> {
  if (!USE_MOCK_DATA) {
    return requestJson<Village[]>('/api/villages');
  }
  await simulateLatency();
  return [...mockVillagesStore];
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  if (!USE_MOCK_DATA) {
    return requestJson<AlertItem[]>('/api/alerts');
  }
  await simulateLatency();
  return [...mockAlertsStore];
}

export async function updateAlertStatus(alertId: string, status: AlertStatus): Promise<AlertItem> {
  if (!USE_MOCK_DATA) {
    return requestJson<AlertItem>(`/api/alerts/${encodeURIComponent(alertId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
  await simulateLatency(100);
  const index = mockAlertsStore.findIndex((a) => a.id === alertId);
  if (index === -1) {
    throw new Error(`Alert ${alertId} not found`);
  }
  const updated: AlertItem = { ...mockAlertsStore[index], status };
  mockAlertsStore = [
    ...mockAlertsStore.slice(0, index),
    updated,
    ...mockAlertsStore.slice(index + 1),
  ];
  return updated;
}

export function buildOverviewSummary(villages: Village[]): OverviewSummary {
  const highRiskVillages = villages
    .filter((v) => v.riskLevel === 'High')
    .sort((a, b) => b.riskScore - a.riskScore);
  const mediumRiskCount = villages.filter((v) => v.riskLevel === 'Medium').length;
  const lowRiskCount = villages.filter((v) => v.riskLevel === 'Low').length;

  return {
    totalVillages: villages.length,
    highRiskCount: highRiskVillages.length,
    mediumRiskCount,
    lowRiskCount,
    highRiskDeltaText: '+1 since last week',
    mediumRiskDeltaText: 'No change since last week',
    lowRiskDeltaText: '−1 since last week',
    weekLabel: 'Week 48 · 24 Nov 2026 · Predicted risk for the next 2 weeks',
    highRiskVillages,
  };
}

