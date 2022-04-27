const Sauce = require("../models/sauce");
const fs = require("fs");
const sauce = require("../models/sauce");

exports.createSauce = (req, res, next) => {
  //  on récupère l'objet JSON de la requête
  const sauceObject = JSON.parse(req.body.sauce);
  delete req.body._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    // enregistrement dans la base de données
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    // cette sauce est retournée dans une promise et envoyée au front-end
    .then((sauce) => {
      // on récupère les informations modifiées de la sauce dans la constante sauceObject
      // on utilise operateur ternaire "?" pour savoir si un fichier image a été ajouté à la requête
      const sauceObject = req.file
        ? // Si le fichier image existe, on traite les strings et la nouvelle image
          {
            // on récupère les chaines de caractères qui sont dans la requête et on parse en objet
            ...JSON.parse(req.body.sauce),
            // on modifie l'url de l'image
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
            // si le fichier image n'existe pas, on traite les autres élements du corps de la requête
          }
        : { ...req.body };

      if (sauceObject.userId === sauce.userId) {
        Sauce.findOne({ _id: req.params.id }).then((sauce) => {
          const filename = sauce.imageUrl.split("/images/")[1];
          const sauceObject = req.file
            ? {
                ...fs.unlink(`images/${filename}`, () => {}),
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
                }`,
              }
            : { ...req.body };
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
      // si les userId ne correspondent pas, on envoi une erreur 403 unauthorized
      else {
        res
          .status(403)
          .json({ error: "vous n'êtes pas autorisé à modifier cette sauce" });
      }
    })
    // si aucune sauce trouvée, on envoi erreur
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: "Sauce non trouvée !" });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({ error: "Requête non autorisée !" });
      }
      const filename = sauce.imageUrl.split("/images")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error: "Sauce non trouvée !" }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeDislike = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;

  // on va chercher la sauce selectionnée
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // on vérifie si l'user a déjà aimé pour éviter de liker plusieurs fois
      // (= son id est dans le tableau usersLiked)
      let userLike = sauce.usersLiked.find((id) => id === userId);
      // on vérifie si l'user a déjà dislike
      let userDislike = sauce.usersDisliked.find((id) => id === userId);

      switch (like) {
        // si like = 1, l'utilisateur aime
        case 1:
          // si l'utilisateur n'a pas encore like
          // on ajoute un like et l'userId dans le tableau correspondant
          if (!userLike) {
            sauce.likes += 1;
            sauce.usersLiked.push(userId);
          } else {
            // si l'utilisateur a déjà like, on envoi une erreur
            throw new Error("un seul like possible!");
          }
          // si l'utilisateur avait déjà fait un dislike, message erreur
          if (userDislike) {
            throw new Error("annuler votre dislike avant de liker!");
          }
          break;

        // si like = 0, l'utilisateur annule son like
        case 0:
          // si l'utilisateur a déjà like,
          // on retire le like et le userId du tableau (on garde ceux qui ont un id différents)
          if (userLike) {
            sauce.likes -= 1;
            sauce.usersLiked = sauce.usersLiked.filter((id) => id !== userId);
          }
          // si l'uitlisateur a déjà dislike,
          // on retire le dislike et le userId du tableau
          else {
            //let userDisliked = sauce.usersDisliked.find(id => id === userId);
            if (userDislike) {
              sauce.dislikes -= 1;
              sauce.usersDisliked = sauce.usersDisliked.filter(
                (id) => id !== userId
              );
            }
          }
          break;

        // si like = -1, l'utilisateur n'aime pas
        case -1:
          // si l'user n'a pas encore dislike
          // on ajoute 1 dislikes et l'userId dans le tableau correspondant
          if (!userDislike) {
            sauce.dislikes += 1;
            sauce.usersDisliked.push(userId);
          } else {
            // si l'utilisateur a déjà dislike, on envoi une erreur
            throw new Error("un seul dislike possible!");
          }
          // si l'utilisateur avait déjà fait un like, message erreur
          if (userLike) {
            throw new Error("annuler votre like avant de disliker!");
          }
      }
      // sauvegarde la sauce avec like/dislike modifiés
      sauce
        .save()
        .then(() =>
          res.status(201).json({ message: "préférence enregistrée !" })
        )
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error: error.message }));
};
