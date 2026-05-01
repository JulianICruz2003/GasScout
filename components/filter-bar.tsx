import { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

type FilterMode = "cheapest" | "closest";

type Props = {
  activeFilter: FilterMode;
  onChangeFilter: (filter: FilterMode) => void;
};

export default function FilterBar({ activeFilter, onChangeFilter }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.tab} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.tabText}>{open ? "‹" : "›"}</Text>
      </Pressable>

      {open ? (
        <View style={styles.card}>
          <Pressable
            style={[
              styles.button,
              activeFilter === "cheapest" && styles.active,
            ]}
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
            style={[
              styles.button,
              activeFilter === "closest" && styles.active,
            ]}
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
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    top: "50%",     
    transform: [{ translateY: -32 }], 
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
    marginTop: 0,
    padding: 8,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
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
});