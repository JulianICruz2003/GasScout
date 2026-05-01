import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import GasMap from "../../components/gas-map";
import FilterBar from "../../components/filter-bar";
import StationCard from "../../components/station-card";
import AIChatBubble from "../../components/ai-chat-bubble";
import stations from "../../stations.json";
import * as Location from "expo-location";

type Station = typeof stations[number];

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
  type FuelType = "petrol" | "diesel" | "electric";

  const [fuelType, setFuelType] = useState<FuelType>("petrol");
  const [activeFilter, setActiveFilter] = useState<FilterMode>("cheapest");
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(10);

  const stationBrands = useMemo(() => {
    return Array.from(
      new Set(stations.map((station) => getStationBrand(station.name)))
    );
  }, []);

  const [selectedBrands, setSelectedBrands] =
    useState<string[]>(stationBrands);

  function getFuelPrice(station: Station, fuelType: FuelType) {
    if (fuelType === "petrol") return station.prices.regular_petrol;
    if (fuelType === "diesel") return station.prices.diesel;
    return station.prices.electric_kwh;
  }

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

      if (!selectedBrands.includes(brand)) return false;

      if (getFuelPrice(station, fuelType) == null) return false;

      if (!userLocation) return true;

      const distance = getDistanceMiles(
        userLocation.lat,
        userLocation.lng,
        station.lat,
        station.lng
      );

      return distance <= maxDistanceMiles;
    });
  }, [selectedBrands, userLocation, maxDistanceMiles, fuelType]);

  // ✅ NEW: sorted list based on toggle
  const sortedStations = useMemo(() => {
    return [...filteredStations].sort((a, b) => {
      if (activeFilter === "closest" && userLocation) {
        const aDistance = getDistanceMiles(
          userLocation.lat,
          userLocation.lng,
          a.lat,
          a.lng
        );
        const bDistance = getDistanceMiles(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng
        );
        return aDistance - bDistance;
      }

      const aPrice = getFuelPrice(a, fuelType) ?? Infinity;
      const bPrice = getFuelPrice(b, fuelType) ?? Infinity;
      return aPrice - bPrice;
    });
  }, [filteredStations, activeFilter, userLocation, fuelType]);

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [highlightedStation, setHighlightedStation] =
    useState<Station | null>(null);
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
        fuelType={fuelType}
        onChangeFuelType={setFuelType}
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

      {/* ✅ NEW SCROLLABLE LIST */}
      <View style={styles.bottomSheet}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stationList}
        >
          {sortedStations.map((station) => {
            const price = getFuelPrice(station, fuelType);

            return (
              <Pressable
                key={station.id}
                style={styles.stationCardWrapper}
                onPress={() => {
                  setSelectedStation(station);
                  setSelectedStationVersion((current) => current + 1);
                }}
                onHoverIn={() => setHighlightedStation(station)}
                onHoverOut={() => setHighlightedStation(null)}
              >
                <StationCard
                  name={station.name}
                  price={price != null ? `$${price.toFixed(2)}` : "N/A"}
                  distance={
                    userLocation
                      ? `${getDistanceMiles(
                          userLocation.lat,
                          userLocation.lng,
                          station.lat,
                          station.lng
                        ).toFixed(1)} miles`
                      : activeFilter === "closest"
                      ? "Closest nearby"
                      : "Cheapest nearby"
                  }
                  address={station.address}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  bottomSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    maxHeight: 140,
  },

  stationList: {
    gap: 12,
    paddingRight: 16,
  },

  stationCardWrapper: {
    width: 420,
  },
});