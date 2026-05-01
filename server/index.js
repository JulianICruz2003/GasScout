import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatPrice(value, unit = "") {
  return value == null ? "N/A" : `$${Number(value).toFixed(2)}${unit}`;
}

function buildStationSummary(stations = []) {
  return stations
    .map((s) => {
      return [
        `Name: ${s.name}`,
        `Address: ${s.address}`,
        `Distance: ${s.distance_text ?? (s.distance_miles != null ? `${s.distance_miles} miles away` : "Unknown")}`,
        `Regular gas: ${formatPrice(s.prices?.regular_petrol)}`,
        `Diesel: ${formatPrice(s.prices?.diesel)}`,
        `EV: ${formatPrice(s.prices?.electric_kwh, "/kWh")}`,
      ].join(" | ");
    })
    .join("\n");
}

app.post("/chat", async (req, res) => {
  try {
    const { messages = [], context = {} } = req.body;

    const stationSummary = buildStationSummary(context.stations ?? []);

    const selectedStationText = context.selectedStation
      ? JSON.stringify(context.selectedStation, null, 2)
      : "None";

    const closestStationText = context.closestStation
      ? JSON.stringify(context.closestStation, null, 2)
      : "Unknown";

    const userLocationAvailable = Boolean(context.userLocationAvailable);

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are the GasScout assistant.

You help users find gas stations from the app's station data.

Important location rules:
- Never mention latitude.
- Never mention longitude.
- Never ask the user for latitude or longitude.
- The frontend already calculated distance_miles and distance_text.
- Use distance_text or distance_miles when describing how far away a station is.
- If userLocationAvailable is true, do NOT say you lack location details.
- If the user asks for the closest gas station, use the Closest station below.

User location available:
${userLocationAvailable}

Selected station:
${selectedStationText}

Closest station:
${closestStationText}

Stations currently available:
${stationSummary}

Answering rules:
- Keep answers short and helpful.
- If the user asks for the closest station, give the station name, distance, address, and regular gas price if available.
- If the user asks for the cheapest station, compare regular gas prices unless they ask for diesel or EV.
- If a station has N/A for a fuel type, do not claim it has that fuel.
- Do not expose raw JSON unless the user asks for technical details.
          `,
        },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chat server error:", error);
    res.status(500).json({
      reply: "Sorry, the AI server had an error.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI server running at http://localhost:${PORT}`);
});