import { View, StyleSheet } from "react-native";
import GasMap from "../../components/gas-map";
import FilterBar from "../../components/filter-bar";
import StationCard from "../../components/station-card";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <GasMap />

      <View style={styles.overlay}>
        <FilterBar />
      </View>

      <View style={styles.bottomSheet}>
        <StationCard
          name="Shell"
          price="$3.29"
          distance="0.8 mi"
          address="123 Main St"
        />
      </View>
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