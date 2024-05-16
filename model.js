import { Schema, model } from "mongoose";

const schemaBalade = new Schema({
    identifiant: { type: String, required: true },
    adresse: { type: String, required: true },
    code_postal: { type: String, required: true },
    parcours: [{ type: String }],
    url_image: { type: String, required: true },
    copyright_image: { type: String, default: null },
    legende: { type: String, default: null },
    categorie: { type: String, required: true },
    nom_poi: { type: String, required: true },
    date_saisie: { type: String, required: true },
    mot_cle: [{ type: String }],
    ville: { type: String, required: true },
    texte_intro: { type: String, required: true },
    texte_description: { type: String, required: true },
    url_site: { type: String, default: null },
    fichier_image: {
        thumbnail: { type: Boolean },
        filename: { type: String },
        format: { type: String },
        width: { type: Number },
        mimetype: { type: String },
        etag: { type: String },
        id: { type: String },
        last_synchronized: { type: String },
        color_summary: [{ type: String }],
        height: { type: Number }
    },
    geo_shape: {
        type: { type: String },
        geometry: {
            type: { type: String },
            coordinates: [{ type: Number }]
        },
        properties: { type: Object, default: {} }
    },
    geo_point_2d: {
        lon: { type: Number },
        lat: { type: Number }
    }
});

const Balade = model("balades", schemaBalade);

export {Balade};