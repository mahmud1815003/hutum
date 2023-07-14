const bot = require('./bot');
const videoExtension = require('video-extensions');
const path = require('path');
const { botMovieModel } = require('../models/movieList');
const {moviesModel} = require('../models/webMovie');
const axios = require('axios');
const ISO6391 = require('iso-639-1');
const moment = require('moment');
const mime = require('mime-types')
const { cap } = require('./capitalLetter');

const movie_group = process.env.main_movie_group;
const series_group = process.env.main_series_group;
const movie = process.env.movie_group;
const series = process.env.series_group;
const uploaderList = process.env.movie_list_server;
const movie_api = process.env.movie_api;
const movieList = process.env.movieData;


const botHandler = async (msg) => {
    try {
        const text = msg?.text;
        const start = text && text?.split(" ")?.[0]?.replace(/\//, "");
        const type = text && text?.split(" ")?.[1]?.split("_")?.[1];
        const id = text && text?.split(" ")?.[1]?.split("_")?.[0];
        if (msg.chat.id == movie_group) {
            const fileName = msg?.caption?.replace(/\r?\n|\r/g, " ");
            const isId = fileName.split(" ")?.[0];
            const imdb_id = isId?.[0] == '#' ? isId?.replace("#", "").trim() : undefined;
            const ext = mime.extension(msg?.document?.mime_type || msg?.video?.mime_type);
            const movie_name = !imdb_id ? fileName?.replace(`.${ext}`, "")?.trim() : fileName?.replace(`.${ext}`, "")?.replace(`#${imdb_id}`, "")?.trim();
            console.log(imdb_id);
            if (msg?.document?.mime_type === 'application/zip' || videoExtension.indexOf(ext) !== -1) {
                const userData = new botMovieModel({
                    sender: `${msg?.from?.first_name} - ${msg?.from?.username}`,
                    senderId: msg?.from?.id,
                    msg_id: msg?.message_id,
                    name: movie_name?.replace(/\[HUTUM 101\]/i, "")?.trim(),
                    imdb_id: imdb_id ? imdb_id : "not provided",
                    type: 'Movie',
                });
                await userData.save();
                await axios.post(uploaderList, {
                    data: userData,
                });
                let data = undefined;
                if (imdb_id) {
                    const subData = await axios.get(`https://api.themoviedb.org/3/find/${imdb_id}?api_key=${movie_api}&language=en-US&external_source=imdb_id`);
                    // console.log(subData?.data?.movie_results?.length > 0);
                    if (subData?.data?.movie_results?.length > 0) {
                        data = subData?.data?.movie_results?.[0];
                    }
                }
                if (data) {
                    const genres = await axios.get(`https://api.themoviedb.org/3/genre/list?api_key=${movie_api}&language=en-US`)
                    const movieDetail = {
                        original_name: data?.original_title,
                        name: data?.title,
                        language: ISO6391.getName(data?.original_language) ? ISO6391.getName(data?.original_language) : data?.original_language,
                        overview: data?.overview,
                        type: data?.media_type,
                        genre: data?.genre_ids?.map(ids => {
                            const x = genres?.data?.genres?.filter(gen => {
                                return ids == gen?.id;
                            });
                            // console.log(x);
                            return x?.[0]?.name ? `#${x?.[0]?.name?.split(" ")?.join("_")}` : null;
                        }).join(", "),
                        release: moment(data?.release_date).format("DD MMMM, YYYY"),
                        overview: data?.overview,
                    }
                    const forward = await bot.copyMessage(movie, movie_group, msg.message_id, {
                        parse_mode: "HTML",
                        caption: `<b>Original Name:</b> ${movieDetail?.original_name}\n\n<b>Title:</b> <u>${movieDetail?.name}</u>\n\n<b>Type:</b> ${cap(movieDetail?.type)}\n<b>Genre:</b> ${movieDetail.genre}\n<b>Language:</b> #${cap(movieDetail?.language)}\n<b>Release:</b> ${movieDetail?.release}\n<b>TMDb Rating:</b> ${data?.vote_average?.toFixed(1) + ' ⭐' || 'Not Rated'}\n\n<b>Overview:</b> ${movieDetail?.overview}\n\n<b><a href="${process.env.movie_invite}">--Movies By HUTUM--</a></b>`
                    });
                    await axios.post(movieList, {
                        data: {
                           alternative: movieDetail?.original_name,
                           Name: movieDetail?.name,
                           genre: movieDetail?.genre,
                           Genre: movieDetail?.type,
                           Language: movieDetail?.language,
                           Release: movieDetail?.release,
                           tel: `https://t.me/c/${movie?.replace('-100', "").trim()}/${forward.message_id}`, 
                        }
                    });
                   let isEx = await moviesModel.findOne({id: data?.id});
                   const t = await axios.get(`https://api.themoviedb.org/3/movie/${data?.id}?api_key=${movie_api}`)
                   // console.log(isEx);
                   if(isEx){
                     await moviesModel.updateOne({id: data?.id}, {
                       ...t.data,
                       msg_id: msg?.message_id,
                     });
                   }else{
                     await moviesModel.create({
                       ...t.data,
                       msg_id: msg?.message_id,
                     });
                   }
                } else {
                    const forward = await bot.copyMessage(movie, movie_group, msg.message_id, {
                        caption: movie_name,
                    });
                    // console.log(movieList);
                    await axios.post(movieList, {
                        data: {
                            Name: movie_name?.replace(/\[HUTUM 101\]/ig, "").trim(),
                            Genre: 'Movie',
                            tel: `https://t.me/c/${movie?.replace('-100', "").trim()}/${forward.message_id}`,
                            alternative: '',
                            genre: '',
                            Language: '',
                            Release: '',
                        }
                    });
                  const newMovie = new moviesModel({
                    title: movie_name?.replace(/\[HUTUM 101\]/ig, ""),
                    imdb_id: imdb_id,
                  })
                  await newMovie.save();
                    //console.log(res);
                }

            } else {
                // console.log(videoExtension);
            }
        } else if (msg.chat.id == series_group) {
            // const file_name = await bot.getFile(msg?.video?.file_id);
            // console.log(file_name);
            console.log(msg?.caption);
            const fileName = msg?.caption?.replace(/\r?\n|\r/g, " ");
            const isId = fileName.split(" ")?.[0];
            const imdb_id = isId?.[0] == '#' ? isId?.replace("#", "").trim() : undefined;
            const ext = mime.extension(msg?.document?.mime_type || msg?.video?.mime_type);
            const movie_name = fileName?.replace(`.${ext}`, "")?.trim();
            console.log(ext);
            if (msg?.document?.mime_type === 'application/zip' || videoExtension.indexOf(ext) !== -1) {
                const userData = new botMovieModel({
                    sender: `${msg?.from?.first_name} - ${msg?.from?.username}`,
                    senderId: msg?.from?.id,
                    msg_id: msg?.message_id,
                    name: movie_name?.replace(/\[HUTUM 101\]/, "")?.trim(),
                    imdb_id: imdb_id ? imdb_id : "not provided",
                    type: 'Series',
                });
                await userData.save();
                await axios.post(uploaderList, {
                    data: userData,
                });
                const forward = await bot.copyMessage(series, series_group, msg.message_id, {
                    caption: movie_name,
                });
                await axios.post(movieList, {
                    data: {
                        Name: movie_name?.replace(/\[HUTUM 101\]/, "").trim(),
                        Genre: 'Series',
                        tel: `https://t.me/c/${series?.replace('-100', "").trim()}/${forward.message_id}`,
                        alternative: '',
                        genre: '',
                        Language: '',
                        Release: '',
                    }
                });
            } else {
                // console.log(msg);
            }
        } else if(start && start == 'start' && type && type == 'movie' && id) {
            const da = await moviesModel.find({imdb_id: id});
            console.log(msg);
            if(da?.length > 0){
              const movieDetail = da[0];
              movieDetail.counter = movieDetail.counter+1;
              const forward = await bot.copyMessage(msg.from.id, movie_group, movieDetail.msg_id, {
                        parse_mode: "HTML",
                        caption: `<b>Original Name:</b> ${movieDetail?.original_title}\n\n<b>Title:</b> <u>${movieDetail?.title}</u>\n\n<b>Type:</b> Movie\n<b>Genre:</b> ${movieDetail?.genres?.map(mov => mov?.name)?.join(", ")}\n<b>Language:</b> #${ISO6391.getName(movieDetail?.original_language) && cap(ISO6391.getName(movieDetail?.original_language))}\n<b>Release:</b> ${moment(movieDetail?.release_date).format("DD MMMM, YYYY")}\n<b>TMDb Rating:</b> ${movieDetail?.vote_average?.toFixed(1) + ' ⭐' || 'Not Rated'}\n\n<b>Overview:</b> ${movieDetail?.overview}\n\n<b><a href="${process.env.movie_invite}">--Movies By HUTUM--</a></b>`
              });
              await movieDetail.save();
            }
            
            // bot.sendMessage(msg?.from?.id, `<b>${sex}</b>`, {
            //   parse_mode: 'HTML'
            // })
            // console.log(msg);
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    botHandler,
}