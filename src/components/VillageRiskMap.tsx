import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { RiskLevel, Village } from '../types/village';
import { getRiskColorHex } from '../utils/risk';
import { RiskBadge } from './ui/RiskBadge';

interface VillageRiskMapProps {
  villages: Village[];
  selectedVillageId: string;
  onSelectVillage: (villageId: string) => void;
  onOpenVillageDetail: (villageId: string) => void;
}

type RiskFilter = 'All' | RiskLevel;

export function VillageRiskMap({
  villages,
  selectedVillageId,
  onSelectVillage,
  onOpenVillageDetail,
}: VillageRiskMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [riskFilter, setRiskFilter] = useState<RiskFilter>('All');

  const counts = useMemo(() => {
    return {
      All: villages.length,
      High: villages.filter((v) => v.riskLevel === 'High').length,
      Medium: villages.filter((v) => v.riskLevel === 'Medium').length,
      Low: villages.filter((v) => v.riskLevel === 'Low').length,
    };
  }, [villages]);

  const filteredVillages = useMemo(() => {
    if (riskFilter === 'All') return villages;
    return villages.filter((v) => v.riskLevel === riskFilter);
  }, [villages, riskFilter]);

  const activeVillage = useMemo(() => {
    return (
      filteredVillages.find((v) => v.id === selectedVillageId) ??
      filteredVillages[0] ??
      villages[0]
    );
  }, [filteredVillages, selectedVillageId, villages]);

  // Initialize Leaflet map once centered on Kothri, Madhya Pradesh (100 km radius)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const KOTHRI_COORDS: [number, number] = [23.091, 76.871];

    const map = L.map(mapContainerRef.current, {
      center: KOTHRI_COORDS,
      zoom: 9,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);

    // 100 km prediction radius around Kothri, MP
    L.circle(KOTHRI_COORDS, {
      radius: 100000,
      color: '#163300',
      weight: 1.5,
      dashArray: '6 4',
      fillColor: '#9FE870',
      fillOpacity: 0.08,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update markers whenever filteredVillages or activeVillage changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    filteredVillages.forEach((village) => {
      const color = getRiskColorHex(village.riskLevel);
      const isSelected = activeVillage?.id === village.id;
      const showLabel = village.riskLevel === 'High' || isSelected;
      const size = isSelected ? 34 : 28;

      const html = `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);cursor:pointer;">
          <div style="
            width:${size}px;
            height:${size}px;
            border-radius:9999px;
            background:${color};
            color:#ffffff;
            font-weight:600;
            font-size:11px;
            display:flex;
            align-items:center;
            justify-content:center;
            border:2px solid #ffffff;
            box-shadow:${isSelected ? '0 0 0 2px #0f172a, 0 2px 6px rgba(15,23,42,0.25)' : '0 1px 4px rgba(15,23,42,0.2)'};
          ">
            ${village.riskScore}
          </div>
          ${
            showLabel
              ? `<span style="
                  margin-top:3px;
                  padding:1px 5px;
                  border-radius:4px;
                  background:rgba(255,255,255,0.92);
                  color:#0f172a;
                  font-size:10px;
                  font-weight:600;
                  white-space:nowrap;
                  border:1px solid #e2e8f0;
                ">${village.name}</span>`
              : ''
          }
        </div>
      `;

      const icon = L.divIcon({
        className: 'vg-marker-icon',
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([village.latitude, village.longitude], { icon });
      marker.on('click', () => {
        onSelectVillage(village.id);
      });
      marker.addTo(layerGroup);
    });
  }, [filteredVillages, activeVillage, onSelectVillage]);

  const filterButtons: { key: RiskFilter; dotClass?: string }[] = [
    { key: 'All' },
    { key: 'High', dotClass: 'bg-red-600' },
    { key: 'Medium', dotClass: 'bg-amber-500' },
    { key: 'Low', dotClass: 'bg-emerald-600' },
  ];

  const latestCases = activeVillage
    ? activeVillage.weeklyCases[activeVillage.weeklyCases.length - 1]?.cases ?? 0
    : 0;

  return (
    <div className="flex flex-col rounded-2xl border border-[#e2e7df] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-base font-bold text-[#163300]">Village risk map</h2>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter map by risk level">
          {filterButtons.map(({ key, dotClass }) => {
            const isActive = riskFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setRiskFilter(key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'border-[#163300] bg-[#163300] text-white'
                    : 'border-[#d4dbd0] bg-white text-[#163300] hover:bg-[#f4f6f3]'
                }`}
              >
                {dotClass && (
                  <span
                    className={`h-2 w-2 rounded-full ${dotClass}`}
                    aria-hidden="true"
                  />
                )}
                <span>{key}</span>
                <span className={isActive ? 'text-[#9FE870]' : 'text-[#5c6b54]'}>
                  · {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-4 h-[360px] w-full overflow-hidden rounded-xl border border-[#d4dbd0] sm:h-[400px]">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {activeVillage && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] max-w-xs rounded-2xl border border-[#d4dbd0] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-bold text-[#163300]">
                {activeVillage.name}
              </span>
              <RiskBadge level={activeVillage.riskLevel} />
            </div>

            <div className="mt-1.5 flex items-center gap-4 text-xs text-[#45553d]">
              <span>
                Risk score{' '}
                <strong className="font-semibold text-[#163300] tabular-nums">
                  {activeVillage.riskScore}
                </strong>
                /100
              </span>
              <span>
                Cases this week{' '}
                <strong className="font-semibold text-[#163300] tabular-nums">
                  {latestCases}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenVillageDetail(activeVillage.id)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#9FE870] px-3.5 py-1.5 text-xs font-semibold text-[#163300] transition-colors hover:bg-[#8cd95c]"
            >
              View village details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-[#5c6b54]">
        Dashed circle shows the 100 km prediction zone around Kothri, Madhya Pradesh. Marker number is the risk score (0–100): Low under 34, Medium 34–66, High above 66.
      </p>
    </div>
  );
}

