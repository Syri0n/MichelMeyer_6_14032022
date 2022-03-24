const mongoose = require("mongoose");

// plugin qui permet de vérifier qu'on a bien 1 utilisateur par adresse mail
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // on vérifie qu'on a bien 1 utlisateur par adresse mail
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
