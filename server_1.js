const express = require("express");
const bodyParser = require("body-parser");
const axios = require('axios');
require('dotenv').config()
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Weather API endpoint
app.get(`/weather/:city`, async (req, res) => {
  const city = req.params.city;
  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    const weatherResponse = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=b2ddfea2e62e4096afc143138240504&q=${city}&aqi=yes`
    );
    
    console.log(weatherResponse.data);
    
    res.status(200).json({data: weatherResponse.data });
  } catch (error) {
    res.status(500).json({ error });
  }
});

const server = app.listen(process.env.SV1_PORT, () => {
  console.log(
    `Server 1 started on PORT: ${process.env.SV1_PORT}`
  );
});
