const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const { createClient } = require("redis");
const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

const connectRedis = async () => {
  await client.connect();
};
connectRedis()

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/status", (req, res) => {
  const status = {
    Status: "Running",
  };
  res.send(status);
});

let callCount = 0;

app.get(`/weather_forecast/:city`, async (req, res) => {
  const city = req.params.city;
  const hashedData = await client.get(city)
  if(hashedData){
    res.status(200).json({ from: "Hashed", data: JSON.parse(hashedData) });
    return;
  }
  try {
    const server = callCount % 2 == 0 ? "Server - 1" : "Server - 2";
    const port_no =
      callCount % 2 == 0 ? process.env.SV1_PORT : process.env.SV2_PORT;
    const response = await axios.get(
      `http://127.0.0.1:${port_no}/weather/:city`
    );
    callCount += 1;
    await client.set(city, JSON.stringify(response.data));
    res.status(200).json({ from: server, data: response.data });
  } catch (error) {
    console.error("Error forwarding request:", error);
    res.status(500).json({ error: "Error forwarding request" });
  }
});

const server = app.listen(process.env.LB_PORT, () => {
  console.log(`Load Balancer started on PORT: ${process.env.LB_PORT}`);
});
