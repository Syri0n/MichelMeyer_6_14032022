const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cryptoJs = require("crypto-js");

const User = require("../models/user");

const mailValidator = require("email-validator");
const passwordValidator = require("password-validator");

/* Création d’un schéma de validation des mdp */
const schema = new passwordValidator();

schema
  .is()
  .min(8)
  .is()
  .max(16)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces()
  .has()
  .symbols();

exports.signup = (req, res, next) => {
  if (!mailValidator.validate(req.body.email)) {
    return res.status(500).json({ message: "Email non valide" });
  } else if (!schema.validate(req.body.password)) {
    return res.status(500).json({
      message:
        "Mot de passe non valide - Utilisez des majuscules, minuscules, chiffres et symboles, aucun espace, pour 8(min) à 16(max) caractères.",
    });
  } else {
    const cryptedEmail = cryptoJs
      .SHA256(req.body.email, process.env.EMAIL_ENCRYPTION_KEY)
      .toString();
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: cryptedEmail,
          password: hash,
        });
        /* Saving the user in the database */
        user
          .save()
          .then(() => res.status(201).json({ message: "Utilisateur créé" }))
          .catch((error) =>
            res.status(400).json({ message: "Utilisateur déjà créer" })
          );
      })
      .catch((error) => res.status(500).json({ error }));
  }
};

exports.login = (req, res, next) => {
  const cryptedEmail = cryptoJs
    .SHA256(req.body.email, process.env.EMAIL_ENCRYPTION_KEY)
    .toString();
  User.findOne({ email: cryptedEmail })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN, {
              expiresIn: "24H",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
