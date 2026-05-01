import { useEffect, useRef, useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import "maplibre-gl/dist/maplibre-gl.css";
import stationsData from "../stations.json";

type Station = typeof stationsData[number];

function formatPrices(prices: {
  regular_petrol?: number | null;
  diesel?: number | null;
  electric_kwh?: number | null;
}) {
  const parts = [];

  if (prices.regular_petrol != null) {
    parts.push(`Regular: $${prices.regular_petrol.toFixed(2)}`);
  }

  if (prices.diesel != null) {
    parts.push(`Diesel: $${prices.diesel.toFixed(2)}`);
  }

  if (prices.electric_kwh != null) {
    parts.push(`EV: $${prices.electric_kwh.toFixed(2)}/kWh`);
  }

  return parts.join(" • ");
}

type Props = {
  stations: Station[];
  selectedStation: Station | null;
  highlightedStation: Station | null;
  selectedStationVersion: number;
};

export default function GasMap({
  stations,
  selectedStation,
  highlightedStation,
  selectedStationVersion,
}: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const stationMarkersRef = useRef<Record<string, any>>({});
  const [zip, setZip] = useState("");

  // 1. Load map ONCE
  useEffect(() => {
    let mounted = true;

    async function loadMap() {
      const maplibregl = await import("maplibre-gl");

      if (!mapContainer.current || !mounted) return;

      const map = new maplibregl.default.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center: [-122.4324, 37.78825],
        zoom: 13,
      });

      mapRef.current = map;

      map.addControl(new maplibregl.default.NavigationControl(), "top-right");

      // user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const longitude = position.coords.longitude;
          const latitude = position.coords.latitude;

          map.flyTo({
            center: [longitude, latitude],
            zoom: 14,
          });

          new maplibregl.default.Marker({ color: "#dc2626" })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.default.Popup().setHTML("You are here"))
            .addTo(map);
        });
      }
    }

    loadMap();

    return () => {
      mounted = false;

      Object.values(stationMarkersRef.current).forEach((marker) => {
        marker.remove();
      });

      stationMarkersRef.current = {};

      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // 2. UPDATE markers when filtered stations change (THIS FIXES YOUR SLIDER)
  useEffect(() => {
    async function updateMarkers() {
      if (!mapRef.current) return;

      const maplibregl = await import("maplibre-gl");

      // remove old markers
      Object.values(stationMarkersRef.current).forEach((marker) => {
        marker.remove();
      });

      stationMarkersRef.current = {};

      // add new filtered markers
      stations.forEach((station) => {
        const marker = new maplibregl.default.Marker({
          color: highlightedStation?.id === station.id ? "#f97316" : "#2563eb",
        })
          .setLngLat([station.lng, station.lat])
          .setPopup(
            new maplibregl.default.Popup().setHTML(
              `<strong>${station.name}</strong><br/>${formatPrices(
                station.prices
              )}<br/>${station.address}`
            )
          )
          .addTo(mapRef.current);

        stationMarkersRef.current[station.id] = marker;
      });
    }

    updateMarkers();
  }, [stations, highlightedStation]);

  // 3. Zoom to selected station
  useEffect(() => {
    if (!selectedStation || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [selectedStation.lng, selectedStation.lat],
      zoom: 15,
    });
  }, [selectedStation, selectedStationVersion]);

  async function searchZip() {
    if (!zip.trim()) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=USA&format=json&limit=1`
    );

    const data = await response.json();

    if (!data?.[0] || !mapRef.current) return;

    const latitude = Number(data[0].lat);
    const longitude = Number(data[0].lon);

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 13,
    });
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchBox}>
        <TextInput
          value={zip}
          onChangeText={setZip}
          placeholder="Enter ZIP code"
          style={styles.input}
          keyboardType="number-pad"
          returnKeyType="search"
          onSubmitEditing={searchZip}
          onKeyPress={(e: any) => {
            if (e.nativeEvent.key === "Enter") {
              searchZip();
            }
          }}
        />

        <Pressable style={styles.button} onPress={searchZip}>
          <Text style={styles.buttonText}>Go</Text>
        </Pressable>
      </View>

      <div ref={mapContainer} style={styles.map as any} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchBox: {
    position: "absolute",
    top: 10,
    left: 64,
    right: 64,
    zIndex: 10,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
  },
});