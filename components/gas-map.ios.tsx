import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import stations from "../stations.json";

export default function GasMap() {
  const [region, setRegion] = useState<Region | null>(null);
  const [zip, setZip] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Location permission denied.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    }

    getLocation();
  }, []);

  async function searchZip() {
    if (!zip.trim()) return;

    try {
      const results = await Location.geocodeAsync(zip.trim());

      if (!results.length) {
        setErrorMsg("ZIP code not found.");
        return;
      }

      const place = results[0];

      setErrorMsg("");

      setRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    } catch {
      setErrorMsg("Could not search that ZIP code.");
    }
  }

  if (!region && !errorMsg) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (!region && errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchBox}>
        <TextInput
          value={zip}
          onChangeText={setZip}
          placeholder="Enter ZIP code"
          style={styles.input}
          keyboardType="number-pad"
          returnKeyType="search"
          onSubmitEditing={searchZip}
        />

        <Pressable style={styles.button} onPress={searchZip}>
          <Text style={styles.buttonText}>Go</Text>
        </Pressable>
      </View>

      {errorMsg ? (
        <View style={styles.messageBox}>
          <Text style={styles.error}>{errorMsg}</Text>
        </View>
      ) : null}

      <MapView
        style={styles.map}
        region={region!}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: region!.latitude,
            longitude: region!.longitude,
          }}
          title="Selected area"
          description={zip ? `ZIP: ${zip}` : "Your current location"}
        />
        {stations.map((station) => (
          <Marker
          key={station.id}
          pinColor="#2563eb"
          coordinate={{
            latitude: station.lat,
            longitude: station.lng,
          }}
          title={station.name}
          description={`${station.prices}`}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontWeight: "600",
  },
  searchBox: {
    position: "absolute",
    top: 135,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 8,
    gap: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
  },
  messageBox: {
    position: "absolute",
    top: 170,
    left: 16,
    right: 16,
    zIndex: 11,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 10,
    elevation: 5,
  },
  error: {
    color: "#b91c1c",
    fontWeight: "700",
    textAlign: "center",
  },
});