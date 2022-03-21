const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator"); // pluggin qui permet de vérifier qu'on a bien 1 utilisateur par adresse mail

const userSchema = mongoose.Schema({
  email: { type: String, require: true, unique: true }, // on vérifie qu'on a bien 1 utlisateur par adresse mail
  password: { type: String, require: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
