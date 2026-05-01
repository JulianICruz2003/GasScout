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

import stationsData from "../stations.json";

type Station = typeof stationsData[number];

function formatPrices(prices: {
  regular_petrol?: number | null;
  diesel?: number | null;
  electric_kwh?: number | null;
}) {
  const parts = [];

  if (prices.regular_petrol != null) {
    parts.push(`Regular: $${prices.regular_petrol.toFixed(2)}`);
  }

  if (prices.diesel != null) {
    parts.push(`Diesel: $${prices.diesel.toFixed(2)}`);
  }

  if (prices.electric_kwh != null) {
    parts.push(`EV: $${prices.electric_kwh.toFixed(2)}/kWh`);
  }

  return parts.join(" • ");
}

type Props = {
  stations: Station[];
  selectedStation: Station | null;
  highlightedStation: Station | null;
  selectedStationVersion: number;
};

export default function GasMap({
  stations,
  selectedStation,
  highlightedStation,
  selectedStationVersion,
}: Props) {
  const [region, setRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
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

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(currentLocation);

      setRegion({
        ...currentLocation,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    }

    getLocation();
  }, []);

  useEffect(() => {
    if (!selectedStation) return;

    setRegion({
      latitude: selectedStation.lat,
      longitude: selectedStation.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  }, [selectedStation, selectedStationVersion]);

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
        {userLocation ? (
          <Marker coordinate={userLocation} title="You" pinColor="#dc2626" />
        ) : null}

        {stations.map((station) => {
          const isHighlighted = highlightedStation?.id === station.id;
          const isSelected = selectedStation?.id === station.id;

          return (
            <Marker
              key={`${station.id}-${
                isHighlighted || isSelected ? "active" : "normal"
              }`}
              coordinate={{
                latitude: station.lat,
                longitude: station.lng,
              }}
              pinColor={
                isSelected ? "#dc2626" : isHighlighted ? "#f97316" : "#2563eb"
              }
              title={station.name}
              description={formatPrices(station.prices)}
            />
          );
        })}
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
    top: 60,
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
    top: 112,
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