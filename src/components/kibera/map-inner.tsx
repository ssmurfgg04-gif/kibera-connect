"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_META, SEVERITY_META, Issue } from "@/lib/kibera";

// Village centroids, hand-placed against the map. These are approximate
// on purpose: villages in Kibera are claimed by their residents, not by
// polygons. The labels give orientation; the dots are the story.
const VILLAGE_LABELS: { name: string; lat: number; lng: number }[] = [
  { name: "Gatwekera", lat: -1.3118, lng: 36.7875 },
  { name: "Soweto West", lat: -1.3193, lng: 36.7858 },
  { name: "Kianda", lat: -1.3203, lng: 36.7905 },
  { name: "Lindi", lat: -1.3138, lng: 36.7928 },
  { name: "Kisumu Ndogo", lat: -1.3162, lng: 36.7908 },
  { name: "Makina", lat: -1.3098, lng: 36.7925 },
  { name: "Karanja", lat: -1.3132, lng: 36.7852 },
  { name: "Olympic", lat: -1.3168, lng: 36.7845 },
  { name: "Laini Saba", lat: -1.3108, lng: 36.7902 },
  { name: "Silanga", lat: -1.3208, lng: 36.7952 },
  { name: "Mashimoni", lat: -1.3128, lng: 36.7942 },
];

function villageLabelIcon(name: string) {
  return L.divIcon({
    className: "kc-village-label",
    html: `<span>${name.toUpperCase()}</span>`,
    iconSize: [110, 16],
    iconAnchor: [55, 8],
  });
}

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
      style={{ background: "#e9e5da" }}
    >
      {/* Esri Light Gray: a quiet canvas so the community dots carry the map.
          The stock OSM style paints a red clinic cross on every corner of
          Kibera, which reads the map as a hospital directory. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxNativeZoom={16}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        maxNativeZoom={16}
      />
      {VILLAGE_LABELS.map((v) => (
        <Marker
          key={`v-${v.name}`}
          position={[v.lat, v.lng]}
          icon={villageLabelIcon(v.name)}
          interactive={false}
          zIndexOffset={-500}
        />
      ))}
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
