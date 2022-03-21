const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const sauceRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");

mongoose
  .connect(
    "mongodb+srv://Syrion:p4w2d8bkwq@cluster0.y4267.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", // connection à mongoDB
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

app.use("/api/sauces/", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
