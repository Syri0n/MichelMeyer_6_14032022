const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const saucesRoutes = require("./routes/sauces");
const usersRoutes = require("./routes/users");

// connection à mongoDB
mongoose.connect("mongodb+srv://Syrion:p4w2d8bkwq@cluster0.y4267.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express(); //initialise express

app.use(express.json()); // donne accès au corps de la requête

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
  next(); // Passe l'exécution au middleware suivant
});

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use("/api/sauces", saucesRoutes); //Pour chaque requête envoyé à images on sert ce dossier statique images
app.use("/api/auth", usersRoutes);

module.exports = app;
