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

export default function MapScreen() {
  const cheapestStation = useMemo(() => getCheapestStation(), []);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  
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
      <GasMap selectedStation={selectedStation} />

      <View style={styles.overlay}>
        <FilterBar />
      </View>

      <AIChatBubble />

      <Pressable
        style={styles.bottomSheet}
        onPress={() => setSelectedStation(cheapestStation)}
      >
        <StationCard
          name={cheapestStation.name}
          price={
          cheapestStation.prices.regular_petrol != null
            ? `$${cheapestStation.prices.regular_petrol.toFixed(2)}`
            : "N/A"
          }
          distance={
            userLocation
              ? `${getDistanceMiles(
                  userLocation.lat,
                  userLocation.lng,
                  cheapestStation.lat,
                  cheapestStation.lng
                ).toFixed(1)} miles away`
              : "Cheapest nearby"
          }
          address={cheapestStation.address}
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