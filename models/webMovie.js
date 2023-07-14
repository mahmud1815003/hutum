// HUTUM Website Server
// Developed by Jaied Bin Mahmud
// KUET BME '18

//External Imports
const mongoose = require("mongoose");

//Schema

const moviesSchema = mongoose.Schema({
  backdrop_path: String,
  genres: [
    {
      id: Number,
      name: String,
    },
  ],
  id: Number,
  imdb_id: String,
  original_language: String,
  original_title: String,
  overview: String,
  poster_path: String,
  production_countries: [
    {
      iso_3166_1: String,
      name: String,
    },
  ],
  release_date: Date,
  runtime: Number,
  tagline: String,
  title: String,
  vote_average: Number,
  msg_id: Number,
  counter: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

//Model
moviesSchema.index({original_title: "text", title: "text"});
const moviesModel = mongoose.model("WebsiteMovie", moviesSchema);

module.exports = {
  moviesModel,
};
