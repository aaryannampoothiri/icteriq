import type { RiskLevel } from '../types/village';

export function getRiskColorHex(level: RiskLevel): string {
  switch (level) {
    case 'High':
      return '#dc2626';
    case 'Medium':
      return '#d97706';
    case 'Low':
      return '#059669';
  }
}

