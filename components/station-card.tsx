import { View, Text, StyleSheet } from "react-native";

type Props = {
  name: string;
  price: string;
  distance: string;
  address: string;
};

export default function StationCard({ name, price, distance, address }: Props) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.distance}>{distance} away</Text>
      </View>

      <View style={styles.pricePill}>
        <Text style={styles.price}>{price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  name: { fontSize: 18, fontWeight: "800" },
  address: { marginTop: 4, color: "#64748b" },
  distance: { marginTop: 8, fontWeight: "600" },
  pricePill: {
    alignSelf: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: "900",
    color: "#166534",
  },
});