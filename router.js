import { Router } from "express";
import { Balade } from "./model.js";
import { isValidObjectId } from "mongoose";

const router = Router();

router.get("/", function(req, rep) {
    rep.json("bonjour");
});

/** 
 * Route pour ajouter une nouvelle balade
 */
router.post("/add-balade", async function(req, rep) {
    const baladeData = req.body;
    const nouvelleBalade = new Balade(baladeData);
    const reponse = await nouvelleBalade.save();
    rep.json(reponse);
});

/** 
 * Route pour récupérer toutes les balades
 */
router.get("/all", async function(req, rep) {
    const balades = await Balade.find();
    rep.json(balades);
});

/** 
 * Route pour mettre à jour une balade
 */
router.put("/update-balade/:id", async function(req, rep) {
    const id = req.params.id;
    const baladeData = req.body;
    const verif = isValidObjectId(id);
    if (!verif) {
        return rep.status(400).json({ msg: "ID invalide" });
    }
    const reponse = await Balade.updateOne({ _id: id }, { $set: baladeData });
    rep.json(reponse);
});

/** 
 * Route pour supprimer une balade
 */
router.delete("/balade/:id", async function(req, rep) {
    const id = req.params.id;
    const verif = isValidObjectId(id);
    if (!verif) {
        return rep.status(400).json({ msg: "ID invalide" });
    }
    const reponse = await Balade.deleteOne({ _id: id });
    rep.json(reponse);
});

/** 
 * 1 Route pour lister toutes les balades disponibles en base de données
 */
router.get("/all", async function(req, rep) {
    try {
        const balades = await Balade.find();
        rep.json(balades);
    } catch (err) {
        rep.status(500).json({ message: err.message });
    }
});

// 2 Route pour récupérer une balade par son identifiant unique
router.get('/id/:id', async (req, res) => {
    const baladeId = req.params.id;
    try {
      const balade = await Balade.findById(baladeId);
      if (balade) {
        res.json(balade);
      } else {
        res.status(404).json({ message: 'Balade non trouvée.' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la récupération de la balade.' });
    }
  });

  // 3 Route pour rechercher les balades par nom_poi ou texte_intro
router.get('/search/:search', async (req, res) => {
    const searchString = req.params.search;
    try {
      const balades = await Balade.find({
        $or: [
          { nom_poi: { $regex: searchString, $options: 'i' } }, 
          { texte_intro: { $regex: searchString, $options: 'i' } }
        ]
      });
      res.json(balades);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la recherche des balades.' });
    }
  });

  // 4 Route pour afficher les balades avec une clé "url_site" non nulle
router.get('/site-internet', async (req, res) => {
    try {
      const balades = await Balade.find({ url_site: { $ne: null } }); 
      res.json(balades);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la récupération des balades avec URL de site internet.' });
    }
  });

  // 5 Route pour afficher les balades avec plus de 5 mots-clés
  router.get('/mot-cle', async (req, res) => {
    try {
        const balades = await Balade.find({ 'mot_cle.5': { $exists: true } });
        const count = await Balade.countDocuments({ 'mot_cle.5': { $exists: true } });
        res.json({ count, balades });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des balades.' });
    }
});

// 6 Route pour afficher les balades publiées lors d'une année spécifique
router.get('/publie/:annee', async (req, res) => {
    const annee = parseInt(req.params.annee);
    const debutAnnee = new Date(annee, 0, 1);
    const finAnnee = new Date(annee + 1, 0, 1);
    
    try {
      const balades = await Balade.find({
        date_publication: {
          $gte: debutAnnee,
          $lt: finAnnee
        }
      }).sort({ date_publication: 1 });
      
      res.json(balades);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la récupération des balades publiées lors de l\'année spécifiée.' });
    }
  });
  
  
  // 7
  router.get('/arrondissement/:num_arrondissement', async (req, res) => {
    try {
        const numArrondissement = req.params.num_arrondissement;

        if (isNaN(numArrondissement) || numArrondissement.length !== 2) {
            return res.status(400).json({ error: 'Numéro d\'arrondissement invalide.' });
        }

        const regex = new RegExp(numArrondissement + '$');
        const count = await Balade.countDocuments({ code_postal: { $regex: regex } });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du comptage des balades.' });
    }
});

// 8 Route pour afficher par arrondissement le nombre de balades disponibles
routern .get('/synthese', async (req, res) => {
    try {
      const synthese = await Balade.aggregate([
        {
          $group: {
            _id: "$arrondissement",
            nombre_balades: { $sum: 1 }
          }
        }
      ]);
      res.json(synthese);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la récupération de la synthèse des balades.' });
    }
  });

  // 9 Route pour afficher les différentes catégories distinctes de balades disponibles

router.get('/categories', async (req, res) => {
    try {
      const categories = await Balade.distinct('categorie');
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur lors de la récupération des catégories de balades.' });
    }
  });
  
 // 10

router.use(express.json());

router.post('/add', async (req, res) => {
  const { nom_poi, adresse, categorie, ...autresChamps } = req.body;

  if (!nom_poi || !adresse || !categorie) {
    return res.status(400).json({ message: 'Les clés "nom_poi", "adresse" et "categorie" sont obligatoires.' });
  }

  try {
    const nouvelleBalade = new Balade({
        nom_poi,
        adresse,
        categorie,
        code_postal,
        parcours,
        url_image,
        copyright_image,
        legende,
        date_saisie,
        mot_cle,
        ville,
        texte_intro,
        texte_description,
        url_site,
        fichier_image,
        geo_shape,
        geo_point_2d
    });

   
    await nouvelleBalade.save();

    res.status(201).json({ message: 'Balade créée avec succès.', balade: nouvelleBalade });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la balade.' });
  }
});

// 11

router.put('/add-mot-cle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { mot_cle } = req.body;

        if (!mot_cle) {
            return res.status(400).json({ error: 'Le mot clé est obligatoire.' });
        }

        const balade = await Balade.findById(id);

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        if (balade.mot_cle.includes(mot_cle)) {
            return res.status(400).json({ error: 'Le mot clé existe déjà.' });
        }

        balade.mot_cle.push(mot_cle);
        await balade.save();

        res.status(200).json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du mot clé.' });
    }
});

// 12

router.put('/update-one/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const miseAJour = req.body;

        const balade = await Balade.findByIdAndUpdate(id, miseAJour, { new: true });

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json(balade);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la balade.' });
    }
});

// 13

router.put('/update-many/:search', async (req, res) => {
    try {
        const { search } = req.params;
        const { nom_poi } = req.body;

        if (!nom_poi) {
            return res.status(400).json({ error: 'Le nom_poi est obligatoire.' });
        }

        const regex = new RegExp(search, 'i'); // Expression régulière insensible à la casse

        const balades = await Balade.updateMany({ texte_description: { $regex: regex } }, { nom_poi });

        if (balades.nModified === 0) {
            return res.status(404).json({ error: 'Aucune balade à mettre à jour.' });
        }

        res.status(200).json({ message: 'Balades mises à jour avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des balades.' });
    }
});

// 14

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const balade = await Balade.findByIdAndDelete(id);

        if (!balade) {
            return res.status(404).json({ error: 'Balade non trouvée.' });
        }

        res.status(200).json({ message: 'Balade supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la balade.' });
    }
});

  


  
  
  
  

export default router;
