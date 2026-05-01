import { useState } from "react";
import { View, Pressable, Text, StyleSheet, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";

type FilterMode = "cheapest" | "closest";

type Props = {
  activeFilter: FilterMode;
  onChangeFilter: (filter: FilterMode) => void;
  maxDistanceMiles: number;
  onChangeMaxDistanceMiles: (miles: number) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  stationBrands: string[];
};

export default function FilterBar({
  activeFilter,
  onChangeFilter,
  maxDistanceMiles,
  onChangeMaxDistanceMiles,
  selectedBrands,
  onToggleBrand,
  stationBrands,
}: Props) {
  const [open, setOpen] = useState(false);
  const [stationMenuOpen, setStationMenuOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.tab} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.tabText}>{open ? "‹" : "›"}</Text>
      </Pressable>

      {open ? (
        <View style={styles.card}>
          <Pressable
            style={[styles.button, activeFilter === "cheapest" && styles.active]}
            onPress={() => onChangeFilter("cheapest")}
          >
            <Text
              style={[
                styles.buttonText,
                activeFilter === "cheapest" && styles.activeText,
              ]}
            >
              Cheapest
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, activeFilter === "closest" && styles.active]}
            onPress={() => onChangeFilter("closest")}
          >
            <Text
              style={[
                styles.buttonText,
                activeFilter === "closest" && styles.activeText,
              ]}
            >
              Closest
            </Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.label}>Within {maxDistanceMiles} miles</Text>

            <Slider
              minimumValue={1}
              maximumValue={25}
              step={1}
              value={maxDistanceMiles}
              onValueChange={onChangeMaxDistanceMiles}
              style={styles.slider}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Stations</Text>

            <Pressable
              style={styles.dropdownButton}
              onPress={() => setStationMenuOpen((v) => !v)}
            >
              <Text style={styles.buttonText}>
                {selectedBrands.length === stationBrands.length
                  ? "All stations"
                  : `${selectedBrands.length} selected`}
              </Text>

              <Text style={styles.buttonText}>
                {stationMenuOpen ? "▲" : "▼"}
              </Text>
            </Pressable>

            {stationMenuOpen ? (
              <ScrollView style={styles.dropdownMenu}>
                {stationBrands.map((brand) => {
                  const selected = selectedBrands.includes(brand);

                  return (
                    <Pressable
                      key={brand}
                      style={[
                        styles.dropdownItem,
                        selected && styles.active,
                      ]}
                      onPress={() => onToggleBrand(brand)}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          selected && styles.activeText,
                        ]}
                      >
                        {brand}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    top: 80,
    bottom: 80,
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    width: 34,
    height: 58,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
  },
  card: {
    marginLeft: 0,
    padding: 8,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: "100%",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    minWidth: 92,
    alignItems: "center",
  },
  active: {
    backgroundColor: "#111827",
  },
  buttonText: {
    fontWeight: "700",
    color: "#111827",
  },
  activeText: {
    color: "white",
  },
  section: {
    marginTop: 10,
    gap: 8,
  },
  label: {
    fontWeight: "800",
    color: "#111827",
  },
  slider: {
    width: 190,
    height: 32,
  },
  dropdownButton: {
    width: 190,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownMenu: {
    width: 190,
    maxHeight: 180,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    padding: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    marginBottom: 6,
  },
});