# HUTUM 101

![HUTUM LOGO](https://github.com/mahmud1815003/mahmud1815003.github.io/blob/main/hutum%20101.png?raw=true )

--- 
This is the main server code of [হুতুম ১০১ (HUTUM 101)](https://www.facebook.com/iamhutum "Goto the Facebook page"), a facebook chatbot. The main purpose of this chatbot is to share the academic materials among the student's of [Khulna University of Engineering and Technology (KUET)](https://kuet.ac.bd/ "KUET Website"). To do that job I have used [dialogflow](https://cloud.google.com/dialogflow "About dialogflow"). It's a Lifelike conversational AI with state-of-the-art virtual agents. It is mainly used to recognize the user command. But these virtual agents can't call any API (Application Programming Interface). When I was trying to implement a searching system which can search a database of books and give the chatbot user if the book is in our google drive/telegram channle or not, I could not do with dialogflow. To do that I have written this server code with the help of [Node.js](https://nodejs.org/ "About Node.js") and [express](https://expressjs.com/ "About Express"). Then connected this server with [dialogflow](https://cloud.google.com/dialogflow "About dialogflow").  

---
<br />
<br />

# Packages Used

In this project various `npm` packages are used. These are:
<br />
1. moment (For Date and time)
2. actions-on-google
3. axios
4. cheerio
5. dialogflow-fulfillment
6. dotenv
7. ejs
8. express
9. googleapis
10. iso-639-1
11. mongoose
12. nodemailer
13. nodemailer-express-handlebars
14. semver

--- 
<br />
<br />

# What this server actually does and it's usage

**হুতুম ১০১ (HUTUM 101)** chatbot has a multiple usage. As mentioned above it can share study materials with the students of **KUET**. Besides there are telegram channels for [movies](https://t.me/moviesbyhutum "HUTUM movie channel"), [books](https://t.me/booksbyhutum "HUTUM book channel") of this chatbot. There are a group of people who maintain these channels and spreadsheets for indexing what they are uploading. This server take the indexed data from these spreadsheets using [sheetdb.io](https://sheetdb.io/ "Goto Website") and store the data in [MongoDB](https://www.mongodb.com/ "Database"). A user can easily search through all the movies or books from the chatbot just typing specific commands. Example:
<br />
<br />
`movie search` for searching movies
<br />
`book search` for searching books

A user can also make request for books and movies if he/she is a student of **KUET/CUET/RUET**. Through the institutional email address they can send request to the admin and the user is notified through automated email from the server if his/her requested is received by the admin. To request a movie or book user just need to type some specific words. These are: 
<br />
<br />
`movie request` for requesting movies
<br />
`book request` for requesting movies

Besides searching movies/books and giving academinc materials, there are other information that the chatbot can provide like:
<br />
1. Daily Namaz Time
2. Real Time Weather Report
3. KUET bus data

and many more.

---
<br />
<br />

# Installation 

The installation process of this server is very easy but get a result from this server will be a little hectic. Because this server is not the only part of this chatbot. This main language processing part is done through [dialogflow](https://cloud.google.com/dialogflow "About dialogflow"). [dialogflow](https://cloud.google.com/dialogflow "About dialogflow") mainly process the user input if it matches with specific command then it will ask for data from the server. Otherwise anyone can run the server in his/her local machine if he/she has already installed Node.js and npm. By running the folloiwng command. 

```nodejs
npm i
```

And adding proper environment variables in the `.env` file.  

---

<br />
<br />

# Conclusion

**হুতুম ১০১ (HUTUM 101)** chatbot is currently used by more than 2000 people around Bangladesh. Because of it's vast data and easy to use commands. You can give it a try right now from [here](https://m.me/iamhutum
 "Chatbot"). Give a "Hi". 

