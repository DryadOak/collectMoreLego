import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import logger from 'morgan'
import bodyParser from 'body-parser';
import expressLayouts from 'express-ejs-layouts';
import fetch from 'node-fetch';
import brickSetApiRouter from './routes/brickSetApi.js';
import userCollectionRouter from './routes/userCollection.js';
import { startUpdateThemesScheduler }  from './services/updateThemesScheduler.js'

dotenv.config();
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@collectmorelego.ocgvfre.mongodb.net/collectMoreLego?retryWrites=true&w=majority`;
mongoose.connect(uri)
    .then((result) => console.log('connected to db'))
    .catch((error) => console.log('failed to connect to db: ' + error))


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.set("layout", "layouts/layout");
const PORT = process.env.PORT || 3000;


app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'))
// Sessions
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
      client: mongoose.connection.getClient(),
      collectionName: 'sessions',
      }),
    })
  )
  
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())


app.use('/brickSetApi', brickSetApiRouter);
app.use('/userCollection', userCollectionRouter);


app.get('/', (req, res) => {
    res.redirect('/userCollection/myCollection')
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    return res.status(500).send("Internal Server Error");
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});


// startUpdateThemesScheduler()