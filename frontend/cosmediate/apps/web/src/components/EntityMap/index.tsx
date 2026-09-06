"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  APILoadingStatus,
  useApiLoadingStatus,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { blueMapStyles, greyMapStyles } from "./lib/utils";
import { Info } from "lucide-react";
import { MapLoader } from "@cosmediate/ui/index";

interface Location {
  id: string | number;
  lat: number;
  lon: number;
}

/** Sensible default when no marker coordinates exist yet (Netherlands). */
const DEFAULT_MAP_CENTER = { lat: 52.3676, lng: 4.9041 };
const DEFAULT_MAP_ZOOM = 6;

const isValidMapLocation = (loc: Location): boolean => {
  const lat = Number(loc.lat);
  const lng = Number(loc.lon);
  return Number.isFinite(lat) && Number.isFinite(lng);
};

interface EntityMapProps {
  locations: Location[];
  mapZoom?: number;
  mapHeight?: number;
  mapType?: "grey" | "blue";
}

const FitMapToLocations = ({
  locations,
  mapZoom,
}: {
  locations: Location[];
  mapZoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || locations.length === 0) return;

    if (locations.length === 1) {
      const only = locations[0];
      if (!only) return;
      map.panTo({ lat: only.lat, lng: only.lon });
      map.setZoom(mapZoom);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    locations.forEach((loc) => {
      bounds.extend({ lat: loc.lat, lng: loc.lon });
    });
    map.fitBounds(bounds, 48);
  }, [map, locations, mapZoom]);

  return null;
};

const ClusterMarkers = ({ locations }: { locations: Location[] }) => {
  const loadStatus = useApiLoadingStatus();

  const map = useMap();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const validLocations = useMemo(
    () => locations.filter(isValidMapLocation),
    [locations],
  );

  useEffect(() => {
    if (!map) return;

    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }

    const clusterer = clustererRef.current;

    clusterer.clearMarkers();
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (validLocations.length === 0) return;

    const newMarkers = validLocations.map((loc) => {
      return new google.maps.Marker({
        position: { lat: Number(loc.lat), lng: Number(loc.lon) },
      });
    });

    markersRef.current = newMarkers;
    clusterer.addMarkers(newMarkers);

    return () => {
      clusterer.clearMarkers();
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, validLocations]);

  if (loadStatus === APILoadingStatus.LOADING) {
    return <MapLoader className={`w-full h-125`} />;
  }

  if (loadStatus === APILoadingStatus.LOADED && validLocations.length === 0) {
    return (
      <div
        className={`w-full h-125 bg-200 rounded-2xl flex items-center justify-center gap-2 text-600 text-sm`}
      >
        <Info className="size-4" />
        <span>Data not available</span>
      </div>
    );
  }

  if (loadStatus === APILoadingStatus.FAILED)
    return (
      <div
        className={`w-full h-125 bg-200 rounded-2xl flex items-center justify-center gap-2 text-600 text-sm`}
      >
        <Info className="size-4" />
        <span>Could not load maps</span>
      </div>
    );

  return null;
};

export const EntityMap = ({
  locations = [],
  mapZoom = DEFAULT_MAP_ZOOM,
  mapHeight,
  mapType = "grey",
}: EntityMapProps) => {
  const validLocations = useMemo(
    () => locations.filter(isValidMapLocation),
    [locations],
  );

  const initialCenter = validLocations.length
    ? { lat: validLocations[0]!.lat, lng: validLocations[0]!.lon }
    : DEFAULT_MAP_CENTER;

  const initialZoom = validLocations.length ? mapZoom : DEFAULT_MAP_ZOOM;

  const containerStyle = {
    width: "100%",
    height: mapHeight ? `${mapHeight}px` : `100%`,
    borderRadius: "12px",
    overflow: "hidden",
  };

  const mapStyles = mapType === "blue" ? blueMapStyles : greyMapStyles;

  return (
    <div style={containerStyle} className="w-full h-full">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Map
          defaultCenter={initialCenter}
          defaultZoom={initialZoom}
        >
          <ApplyLocalStyles mapStyles={mapStyles} />
          <FitMapToLocations locations={validLocations} mapZoom={mapZoom} />
          <ClusterMarkers locations={validLocations} />
        </Map>
      </APIProvider>
    </div>
  );
};

const ApplyLocalStyles = ({
  mapStyles,
}: {
  mapStyles: google.maps.MapTypeStyle[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    map.setOptions({
      styles: mapStyles,
      disableDefaultUI: true,
      minZoom: 1,
      maxZoom: 18,
      gestureHandling: "greedy",
    });
  }, [map, mapStyles]);

  return null;
};
