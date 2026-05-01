import { useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import GasMap from "../../components/gas-map";
import FilterBar from "../../components/filter-bar";
import StationCard from "../../components/station-card";
import AIChatBubble from "../../components/ai-chat-bubble";
import stations from "../../stations.json";

type Station = typeof stations[number];

function getCheapestStation() {
  return [...stations].sort((a, b) => {
    const aPrice = a.prices.regular_petrol ?? Infinity;
    const bPrice = b.prices.regular_petrol ?? Infinity;
    return aPrice - bPrice;
  })[0];
}

export default function MapScreen() {
  const cheapestStation = useMemo(() => getCheapestStation(), []);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

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
          distance="Cheapest nearby"
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
    left: 16,
    right: 16,
    zIndex: 20,
  },
  bottomSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
});