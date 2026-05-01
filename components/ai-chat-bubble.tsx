import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import stationsData from "../stations.json";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Station = typeof stationsData[number];

type Props = {
  stations: Station[];
  selectedStation: Station | null;
  userLocation: { lat: number; lng: number } | null;
};

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:3001/chat"
    : "http://172.20.208.105:3001/chat";

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

export default function AIChatBubble({
  stations,
  selectedStation,
  userLocation,
}: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I can help you find cheaper gas nearby.",
    },
  ]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  function prepareStationForAI(station: Station) {
    const distance =
      userLocation && station.lat && station.lng
        ? getDistanceMiles(
          userLocation.lat,
          userLocation.lng,
          station.lat,
          station.lng
        )
        : null;

    return {
      id: station.id,
      name: station.name,
      address: station.address,
      prices: station.prices,
      distance_miles: distance != null ? Number(distance.toFixed(1)) : null,
    };
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const stationsForAI = stations.map(prepareStationForAI);

    const selectedStationForAI = selectedStation
      ? prepareStationForAI(selectedStation)
      : null;

    try {
      const stationsForAI = stations.map(prepareStationForAI);

      const closestStationForAI =
        userLocation
          ? [...stationsForAI]
            .filter((station) => station.distance_miles != null)
            .sort((a, b) => a.distance_miles! - b.distance_miles!)[0]
          : null;

      const selectedStationForAI = selectedStation
        ? prepareStationForAI(selectedStation)
        : null;
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            stations: stationsForAI,
            selectedStation: selectedStationForAI,
            userLocation: userLocation ? "available" : null,
            instructions:
              "Never return latitude or longitude. Always describe station locations using distance_miles in miles.",
          },
        }),
      });

      const data = await response.json();
      console.log("AI RESPONSE:", data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Sorry, I had trouble answering that.",
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not connect to the AI server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Pressable style={styles.bubble} onPress={() => setOpen(true)}>
        <Text style={styles.bubbleText}>💬</Text>
      </Pressable>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.chatWindow}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gas Assistant</Text>
        <Pressable onPress={() => setOpen(false)}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, index) => String(index)}
        style={styles.messages}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.role === "user" ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about gas..."
          style={styles.input}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          onKeyPress={(e: any) => {
            if (e.nativeEvent.key === "Enter" && !e.shiftKey) {
              e.preventDefault?.();
              sendMessage();
            }
          }}
        />

        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    right: 20,
    bottom: 130,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    elevation: 10,
  },
  bubbleText: {
    fontSize: 28,
  },
  chatWindow: {
    position: "absolute",
    left: 1080,
    right: 16,
    bottom: 150,
    height: 250,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 14,
    zIndex: 100,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
  },
  close: {
    fontSize: 20,
    fontWeight: "900",
  },
  messages: {
    flex: 1,
  },
  message: {
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
    maxWidth: "85%",
  },
  userMessage: {
    backgroundColor: "#dbeafe",
    alignSelf: "flex-end",
  },
  aiMessage: {
    backgroundColor: "#f1f5f9",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#111827",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 90,
  },
  sendButton: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  sendText: {
    color: "white",
    fontWeight: "800",
  },
});