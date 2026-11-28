export type RiskLevel = 'High' | 'Medium' | 'Low';

export type AlertStatus = 'New' | 'Acknowledged' | 'In progress' | 'Resolved';

export type PageId = 'overview' | 'village-detail' | 'alerts' | 'environmental';

export interface WeeklyCasePoint {
  week: string;
  weekNumber: number;
  cases: number;
}

export interface EnvironmentalWeekPoint {
  week: string;
  weekNumber: number;
  rainfallMm: number;
  tempAvg: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  soilMoisture: number;
  waterContaminationIndex: number;
}

export interface RiskDriver {
  label: string;
  contributionPct: number;
}

export interface Village {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  population: number;
  nearestHealthCenterKm: number;
  riskLevel: RiskLevel;
  riskScore: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilMoisture: number;
  waterContaminationIndex: number;
  weeklyCases: WeeklyCasePoint[];
  forecastCases: WeeklyCasePoint[];
  environmentalHistory: EnvironmentalWeekPoint[];
  riskDrivers: RiskDriver[];
}

export interface AlertItem {
  id: string;
  villageId: string;
  villageName: string;
  riskLevel: RiskLevel;
  title: string;
  description: string;
  casesPer1000: number;
  dateLabel: string;
  isoDate: string;
  status: AlertStatus;
}

export interface OverviewSummary {
  totalVillages: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  highRiskDeltaText: string;
  mediumRiskDeltaText: string;
  lowRiskDeltaText: string;
  weekLabel: string;
  highRiskVillages: Village[];
}
