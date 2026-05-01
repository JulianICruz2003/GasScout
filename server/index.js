import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildStationSummary(stations = []) {
  return stations
    .map((s) => {
      return [
        `Name: ${s.name}`,
        `Address: ${s.address}`,
        `Regular gas: ${s.prices?.regular_petrol ?? "N/A"}`,
        `Diesel: ${s.prices?.diesel ?? "N/A"}`,
        `EV: ${s.prices?.electric_kwh ?? "N/A"}`,
        `Latitude: ${s.lat}`,
        `Longitude: ${s.lng}`,
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

    const userLocationText = context.userLocation
      ? `${context.userLocation.lat}, ${context.userLocation.lng}`
      : "Unknown";

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are the GasScout assistant.

You help users understand the gas stations shown on their app map.

Use the station data below when answering questions about:
- cheapest gas
- diesel availability
- EV charging
- station addresses
- selected station
- nearby stations
- gas prices

User location:
${userLocationText}

Selected station:
${selectedStationText}

Stations currently on the map:
${stationSummary}

Rules:
- If the user asks about gas stations, use the station data.
- If the user asks for the cheapest station, compare regular gas prices.
- If a station has N/A for a fuel type, do not claim it has that fuel.
- Keep answers short and helpful.
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