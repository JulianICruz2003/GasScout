import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gas Assistant</Text>
      <Text style={styles.message}>
        Ask about nearby prices, routes, app features, or general gas questions.
      </Text>

      <View style={styles.inputBar}>
        <TextInput
          placeholder="Ask something..."
          style={styles.input}
          multiline
        />
        <Pressable style={styles.send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70, backgroundColor: "#f8fafc" },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 16 },
  message: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 18,
    color: "#334155",
  },
  inputBar: {
    marginTop: "auto",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
  },
  input: { flex: 1, minHeight: 44 },
  send: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: { color: "white", fontWeight: "800" },
});