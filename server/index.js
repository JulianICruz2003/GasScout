import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("GasScout AI server is running.");
});

app.post("/chat", async (req, res) => {
  console.log("Chat route hit:", req.body);

  try {
    const { messages = [] } = req.body;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are GasScout AI. Help users find cheap gas, compare stations, explain filters, and answer briefly.",
        },
        ...messages,
      ],
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({
      reply: "Sorry, I could not connect to the AI right now.",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});