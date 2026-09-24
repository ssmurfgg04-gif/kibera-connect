"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_META, SEVERITY_META, Issue } from "@/lib/kibera";

function severityIcon(severity: string, category: string, active: boolean) {
  const color = SEVERITY_META[severity as keyof typeof SEVERITY_META]?.color ?? "#d98e32";
  const size = active ? 22 : 16;
  const pulse = severity === "critical" || severity === "high" ? `<span class="ring" style="color:${color}"></span>` : "";
  return L.divIcon({
    className: "kc-marker",
    html: `<div style="position:relative;color:${color}">${pulse}<span class="dot" style="background:${color};width:${size}px;height:${size}px;display:block"></span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FlyTo({ selected }: { selected: Issue | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected && selected.latitude != null && selected.longitude != null) {
      map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 16), { duration: 0.9 });
    }
  }, [selected, map]);
  return null;
}

export default function MapInner({
  issues,
  selectedId,
  onSelect,
}: {
  issues: Issue[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const selected = useMemo(() => issues.find((i) => i.id === selectedId) ?? null, [issues, selectedId]);
  const points = useMemo(
    () => issues.filter((i) => i.latitude != null && i.longitude != null),
    [issues]
  );

  return (
    <MapContainer
      center={[-1.3145, 36.7892]}
      zoom={15}
      minZoom={13}
      maxZoom={18}
      zoomControl={true}
      attributionControl={true}
      className="h-full w-full"
      style={{ background: "#e8e2d4" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxNativeZoom={19}
      />
      {points.map((issue) => (
        <Marker
          key={issue.id}
          position={[issue.latitude as number, issue.longitude as number]}
          icon={severityIcon(issue.severity, issue.category, issue.id === selectedId)}
          eventHandlers={{ click: () => onSelect(issue.id) }}
          zIndexOffset={issue.id === selectedId ? 1000 : issue.severity === "critical" ? 500 : 0}
        />
      ))}
      <FlyTo selected={selected} />
    </MapContainer>
  );
}
