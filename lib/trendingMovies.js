//External Imports 
const axios = require('axios');
const iso = require('iso-639-1');
const moment = require('moment');


//Interanl Imports
const key = process.env.movieDataApi;
const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${key}`
const imageUrl = `https://image.tmdb.org/t/p/w500`;

const decoder = async () => {
    try{
        const data = await axios.get(url);
        const movies = data.data.results;
        let dataSet = [];
        for(let i = 0; i < 3 && i < movies.length; i++){
            const x = {
                name: movies[i].title,
                original_name: movies[i].original_title,
                language: iso.getName(movies[i].original_language),
                overview: movies[i].overview,
                release: moment(movies[i].release_date).utcOffset(6).format("DD MMMM, YYYY"),
                poster: imageUrl+movies[i].poster_path,
                age_restrictions: movies[i].adult ? 'Yes [18+]' : 'No',
            }
            dataSet.push(x);
        }
        return dataSet;
    }catch(error){
        console.log(error);
        return false;
    }
}

module.exports = {
    decoder,
}