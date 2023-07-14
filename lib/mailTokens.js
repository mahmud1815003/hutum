const {google} = require('googleapis');
const nodemailer = require('nodemailer');

const CLIENT_ID = `${process.env.CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.CLIENT_SECRET}`;
const REDIRECT_URI = `${process.env.REDIRECT_URI}`;
const REFRESH_TOKEN = `${process.env.REFRESH_TOKEN}`;

const CLIENT_ID_SERVER = `${process.env.CLIENT_ID_SERVER}`;
const CLIENT_SECRET_SERVER = `${process.env.CLIENT_SECRET_SERVER}`;
const REFRESH_TOKEN_SERVER = `${process.env.REFRESH_TOKEN_SERVER}`;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const oAuth2Client_SERVER = new google.auth.OAuth2(CLIENT_ID_SERVER, CLIENT_SECRET_SERVER, REDIRECT_URI);
oAuth2Client_SERVER.setCredentials({refresh_token: REFRESH_TOKEN_SERVER});

async function mailToken(type){
    if(type === 'server'){
        const accessToken = await oAuth2Client_SERVER.getAccessToken();
        const transporter = await nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: `${process.env.fromServer}`,
            clientId: CLIENT_ID_SERVER,
            clientSecret: CLIENT_SECRET_SERVER,
            refreshToken: REFRESH_TOKEN_SERVER,
            accessToken: accessToken
          }
        });
        return transporter;
    }else{
        const accessTokens = await oAuth2Client.getAccessToken();
        const transporter = await nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: `${process.env.fromEmail}`,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessTokens
          }
        });
        return transporter;
    }
}

module.exports = {
    mailToken
}
