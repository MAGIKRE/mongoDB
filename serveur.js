// on va pouvoir écrire du code 
import express from "express" ;
import route from "./router.js" // tout le code écrit dans le fichier router.js
import { connect } from "mongoose" // tree shaking 

connect("mongodb+srv://anthonyselin02:Azertyui12345678@cluster0.jjpi2fw.mongodb.net/paris") // opération asynchrone 
    .then(function(){
        console.log("connexion mongo réussie")
    })
    .catch(function(err){
        console.log(new Error(err))
    })
   /*  async function connexion(){ 
        try{
            await connect("mongodb+srv://h3-b3dev:OnWn6WzeU30hqbLd@cluster0.fag5rrh.mongodb.net/flotte")
            console.log("connexion mongo réussie")
        }catch(err){
            console.log(new Error(err))
        }
    } */
// est stocker dans une variable route 
const app = express();
const PORT = 1235 ;
// avaht app.use(route)

app.use(express.json()); // permet à notre server d'accepter les requetes ajax qui envoie du JSON  // middleware

app.use(route) ; 
// créer deux fichiers en + 
// fichier model.js => ajouter les model / schema
// router.js => app.get(...)
app.listen(PORT , function(){
    console.log(`serveur express écoute sur le port ${PORT}`)
})
// créer un serveur qui écoute sur l'adresse http://localhost:1234