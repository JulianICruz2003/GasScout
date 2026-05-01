import { useEffect, useRef, useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import "maplibre-gl/dist/maplibre-gl.css";
import stations from "../stations.json";

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

export default function GasMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [zip, setZip] = useState("");

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

      stations.forEach((station) => {
        new maplibregl.default.Marker({ color: "#2563eb" })
          .setLngLat([station.lng, station.lat])
          .setPopup(
            new maplibregl.default.Popup().setHTML(
              `<strong>${station.name}</strong><br/>${formatPrices(station.prices)}<br/>${station.address}`
            )
          )
          .addTo(map);
      });

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
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

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
    left: 16,
    right: 16,
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