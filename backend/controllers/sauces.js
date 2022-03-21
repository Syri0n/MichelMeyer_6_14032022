const Sauce = require("../models/sauces");

exports.createSauce = (req, res, next) => {
  delete req.body._id;
  const sauce = new Sauce({
    ...req.body, // L'opérateur spread ... est utilisé pour faire une copie de tous les éléments de req.body
  });
  sauce.save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, 
    { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _i: req.params.id}).then(     // On récupère la sauce
    (sauce) => {
      if (!sauce) {
        return res.status(404).json({
          error: new Error('Objet non trouvé !')
        });
      }
      if (sauce.userId !== req.auth.userId) {   // On vérifie que la sauce appartiens bien a celui qui fait la requête
        return res.status(401).json({
          error: new Error('Requête non autorisée !')
        });
      }
      Sauce.deleteOne({ _id: req.params.id }).then(  // Si oui, on la supprime
        () => {
          res.status(200).json({ 
            message: "Objet supprimé !" 
          });
        }
    ).catch(
      (error) => {
        res.status(400).json({ 
          error: error 
        });
      }
    );
    }
  );
};

exports.findOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400));
};
