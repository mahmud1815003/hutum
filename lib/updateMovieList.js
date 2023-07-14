//External Imports
const axios = require('axios');
const moment = require('moment');

//Internal Imports
const Movies = require('../models/movie');
const RequestsCount = require('../models/requestCount');
const {sendTextMail, textMailProperty} = require('../lib/sendTextMail');

const getMovies = async () => {
    try {
      const s = await axios.get(`${process.env.movieData}`);
      const moviesData = s.data;
      let mongodbMovies = await Movies.find();
      let update = 0;
      let deleted = 0;
      let finalMovies = mongodbMovies.length;
      for (let i of mongodbMovies) {
        let bool = moviesData.find((entertainment) => {
          if (entertainment.alternative === i.alternative && entertainment.Name === i.Name && entertainment.Release === i.Release && entertainment.Links === i.Links && entertainment.Genre === i.Genre && entertainment.Language === i.Language && entertainment.tel === i.tel) {
            return true;
          }
        });
        if (!bool) {
          deleted++;
          Movies.deleteOne({ alternative: i.alternative, Name: i.Name, Genre: i.Genre, Language: i.Language, Release: i.Release, Links: i.Links, tel: i.tel }, (error) => {
            if (error) console.log('Removing Error ' + error);
          });
        }
      }
      for (let i of moviesData) {
        let finalData = new Movies(i);
        //console.log(i.Name);
        const bool = mongodbMovies.find((entertainment) => {
          if (entertainment.alternative === i.alternative && entertainment.Name === i.Name && entertainment.Release === i.Release && entertainment.Links === i.Links && entertainment.Genre === i.Genre && entertainment.Language === i.Language && entertainment.tel === i.tel) {
            return true;
          }
        });
        if (!bool && (i.Links != '' || i.tel != '') && i.Name != '') {
          update++;
          finalData.save((error) => {
            if (error) {
              console.log(error);
            }
          });
        }
      }
      finalMovies = finalMovies - deleted + update;
      const dat = await RequestsCount.find({});
      const data = dat[0];
      const date = moment(new Date()).utcOffset(6).format('DD/MM/YYYY,  h:mm A');
      const message = `------Movie Data Report------\n\nAdded Movies/Series: ${update}\nDeleted Movies/Series: ${deleted}\n\nTotal Movies/Series: ${finalMovies}\nTotal Movie Request: ${data.movie} (since 24/10/21)\n\nTotal Book Request: ${data.book} (since 24/10/21)\n\nUpdated: ${date}`;
      const res = await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);
  
      return true;
      //console.log('SuccessFul');
    } catch {
      const sub = `Hutum Entertainment Drive Data Report`;
      const mailBody = `There is problem in Data Writing to MongoDB. Please Forward this Mail to Developer`;
      const property = textMailProperty('server', `${process.env.fromEmail}`, sub, mailBody);
      await sendTextMail(property);  
      const message = `------Movie Data Report------\n\nThere is a problem in Movie Database Update`;
      await axios.get(`https://api.telegram.org/bot${process.env.telapi}/sendMessage?chat_id=${process.env.chatId}&text=${message}`);  
      return false;
    }
  }

  module.exports = {
    getMovies,
  }