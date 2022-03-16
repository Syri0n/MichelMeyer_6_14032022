const express = require("express");
const mongoose = require("mongoose");
// const cors = require("cors");

mongoose
  .connect(
    "mongodb+srv://Syrion:p4w2d8bkwq@cluster0.y4267.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

// MIDDLEWARES

// app.use(cors());

//ROUTES

module.exports = app;
