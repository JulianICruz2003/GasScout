import { useState } from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";

type FilterMode = "cheapest" | "closest";
type FuelType = "petrol" | "diesel" | "electric";

type Props = {
  activeFilter: FilterMode;
  onChangeFilter: (filter: FilterMode) => void;
  fuelType: FuelType;
  onChangeFuelType: (fuelType: FuelType) => void;
  maxDistanceMiles: number;
  onChangeMaxDistanceMiles: (miles: number) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  stationBrands: string[];
};

export default function FilterBar({
  activeFilter,
  onChangeFilter,
  fuelType,
  onChangeFuelType,
  maxDistanceMiles,
  onChangeMaxDistanceMiles,
  selectedBrands,
  onToggleBrand,
  stationBrands,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.filterButton} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.filterButtonText}>
          {open ? "Close filters" : "Filters"}
        </Text>
      </Pressable>

      {open ? (
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Sort by</Text>

            <View style={styles.row}>
              <Pressable
                style={[
                  styles.chip,
                  activeFilter === "cheapest" && styles.active,
                ]}
                onPress={() => onChangeFilter("cheapest")}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeFilter === "cheapest" && styles.activeText,
                  ]}
                >
                  Cheapest
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.chip,
                  activeFilter === "closest" && styles.active,
                ]}
                onPress={() => onChangeFilter("closest")}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeFilter === "closest" && styles.activeText,
                  ]}
                >
                  Closest
                </Text>
              </Pressable>
            </View>

            <Text style={styles.title}>Fuel type</Text>

            <View style={styles.row}>
              {(["petrol", "diesel", "electric"] as FuelType[]).map((type) => {
                const selected = fuelType === type;

                return (
                  <Pressable
                    key={type}
                    style={[styles.chip, selected && styles.active]}
                    onPress={() => onChangeFuelType(type)}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.activeText]}
                    >
                      {type[0].toUpperCase() + type.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.title}>Within {maxDistanceMiles} miles</Text>

            <Slider
              minimumValue={1}
              maximumValue={25}
              step={1}
              value={maxDistanceMiles}
              onValueChange={onChangeMaxDistanceMiles}
              style={styles.slider}
            />

            <Text style={styles.title}>Stations</Text>

            <View style={styles.brandGrid}>
              {stationBrands.map((brand) => {
                const selected = selectedBrands.includes(brand);

                return (
                  <Pressable
                    key={brand}
                    style={[styles.brandChip, selected && styles.active]}
                    onPress={() => onToggleBrand(brand)}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.activeText]}
                    >
                      {brand}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 140,
    zIndex: 40,
  },
  filterButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    elevation: 6,
  },
  filterButtonText: {
    color: "white",
    fontWeight: "900",
  },
  sheet: {
    marginTop: 10,
    maxHeight: 360,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  title: {
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 10,
    marginTop: 12,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  chipText: {
    fontWeight: "800",
    color: "#111827",
  },
  active: {
    backgroundColor: "#f97316",
  },
  activeText: {
    color: "white",
  },
  slider: {
    width: "100%",
    height: 36,
  },
  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 8,
  },
  brandChip: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
});