const bcrypt = require("bcrypt"); // addon cryptage mdp
const jwt = require('jsonwebtoken') // pour la créa des tokens pour la créa des comptes user

const User = require("../models/user");

// Middleware d'autentification

// pour l'enregistrement des nouveaux users
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user.save()
        .then(() => res.status(201).json({ message: "Utilisateur créé ! " }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// pour la connexion des users existant
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })  // On récupère l'utlisateur de la base qui correspond à l'adresse mail entrée
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !'})
      }
      bcrypt.compare( req.body.password, user.password) // on compare le mdp avec le hash qui est stocké dans la BDD
        .then( valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !'})
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM-TOKEN_SECRET',
              { expiresIn: '24h'}
            )
          });
        })
        .catch(error => res.status(500).json({ error }))
    })
    .catch(error => res.status(500).json({ error }));
};
