import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import GasMap from "../../components/gas-map";
import FilterBar from "../../components/filter-bar";
import StationCard from "../../components/station-card";
import AIChatBubble from "../../components/ai-chat-bubble";
import stations from "../../stations.json";
import * as Location from "expo-location";

type Station = typeof stations[number];

function getCheapestStation() {
  return [...stations].sort((a, b) => {
    const aPrice = a.prices.regular_petrol ?? Infinity;
    const bPrice = b.prices.regular_petrol ?? Infinity;
    return aPrice - bPrice;
  })[0];
}

function getDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStationBrand(name: string) {
  return name.split(" - ")[0].trim();
}

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  type FilterMode = "cheapest" | "closest";
  const [activeFilter, setActiveFilter] = useState<FilterMode>("cheapest");
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(10);
  const stationBrands = useMemo(() => {
    return Array.from(new Set(stations.map((station) => getStationBrand(station.name))));
  }, []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(stationBrands);

  function toggleBrand(brand: string) {
    setSelectedBrands((current) =>
      current.includes(brand)
        ? current.filter((item) => item !== brand)
        : [...current, brand]
    );
  }

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const brand = getStationBrand(station.name);

      if (!selectedBrands.includes(brand)) {
        return false;
      }

      if (!userLocation) {
        return true;
      }

      const distance = getDistanceMiles(
        userLocation.lat,
        userLocation.lng,
        station.lat,
        station.lng
      );

      return distance <= maxDistanceMiles;
    });
  }, [selectedBrands, userLocation, maxDistanceMiles]);

  const cheapestStation = useMemo(() => {
    return [...filteredStations].sort((a, b) => {
      const aPrice = a.prices.regular_petrol ?? Infinity;
      const bPrice = b.prices.regular_petrol ?? Infinity;
      return aPrice - bPrice;
    })[0] ?? stations[0];
  }, [filteredStations]);

  const closestStation = useMemo(() => {
    if (!userLocation) return null;

    return [...filteredStations].sort((a, b) => {
      const aDistance = getDistanceMiles(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const bDistance = getDistanceMiles(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return aDistance - bDistance;
    })[0] ?? null;
  }, [userLocation, filteredStations]);

  const featuredStation =
    activeFilter === "closest" && closestStation
      ? closestStation
      : cheapestStation;


  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [highlightedStation, setHighlightedStation] = useState<Station | null>(null);
  const [selectedStationVersion, setSelectedStationVersion] = useState(0);

  useEffect(() => {
    async function loadLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});

      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }

    loadLocation();
  }, []);

  return (
    <View style={styles.container}>
      <GasMap
        stations={filteredStations}
        selectedStation={selectedStation}
        highlightedStation={highlightedStation}
        selectedStationVersion={selectedStationVersion}
      />

      <FilterBar
        activeFilter={activeFilter}
        onChangeFilter={setActiveFilter}
        maxDistanceMiles={maxDistanceMiles}
        onChangeMaxDistanceMiles={setMaxDistanceMiles}
        selectedBrands={selectedBrands}
        onToggleBrand={toggleBrand}
        stationBrands={stationBrands}
      />

      <AIChatBubble
        stations={stations}
        selectedStation={selectedStation}
        userLocation={userLocation}
      />

      <Pressable
        style={styles.bottomSheet}
        onPress={() => {
          setSelectedStation(featuredStation);
          setSelectedStationVersion((current) => current + 1);
        }}
        onHoverIn={() => setHighlightedStation(featuredStation)}
        onHoverOut={() => setHighlightedStation(null)}
      >
        <StationCard
          name={featuredStation.name}
          price={
            featuredStation.prices.regular_petrol != null
              ? `$${featuredStation.prices.regular_petrol.toFixed(2)}`
              : "N/A"
          }
          distance={
            userLocation
              ? `${getDistanceMiles(
                userLocation.lat,
                userLocation.lng,
                featuredStation.lat,
                featuredStation.lng
              ).toFixed(1)} miles`
              : activeFilter === "closest"
                ? "Closest nearby"
                : "Cheapest nearby"
          }
          address={featuredStation.address}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 60,
    left: 64,
    right: 64,
    zIndex: 20,
  },
  bottomSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
});