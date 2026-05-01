import { View, Pressable, Text, StyleSheet } from "react-native";

export default function FilterBar() {
  return (
    <View style={styles.card}>
      <Pressable style={styles.active}>
        <Text style={styles.activeText}>Cheapest</Text>
      </Pressable>

      <Pressable style={styles.button}>
        <Text>Nearest</Text>
      </Pressable>

      <Pressable style={styles.button}>
        <Text>Regular</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 8,
    padding: 8,
    borderRadius: 18,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  active: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#111827",
  },
  activeText: {
    color: "white",
    fontWeight: "700",
  },
});