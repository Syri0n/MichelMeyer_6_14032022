const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
    delete req.body._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  if(req.file){ //si on trouve un fichier image dans la requête alors
      Sauce.findOne({ _id: req.params.id }) //Recherche la sauce avec cet Id
      .then(sauce => {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, (err) => { //supprime cette photo qui est donc l'ancienne
              if (err) 
              throw err
          });
      })
      .catch(error => res.status(400).json({error}));
  }

  const sauceObject = req.file ? // si on trouve un fichier image dans la requête alors
  {
      ...JSON.parse(req.body.sauce), //on récupère l'objet json
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //et on ajoute l'image URL
  } : { ...req.body} //sinon on prend le corps de la requête
  Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id }) //On modifie celui dont l'ID est égale à l'ID envoyé dans les paramètres de requêtes
      .then(() => res.status(200).json({message:'Sauce modifiée'}))
      .catch(error => res.status(400).json({error}));
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then( sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};