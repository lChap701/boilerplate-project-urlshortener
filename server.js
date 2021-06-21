require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

/* My code */
const isUrl = require("is-valid-http-url");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoose = require("mongoose");

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let db = mongoose.connection;

// Displays connection errors
db.on('error', console.error.bind(console, 'connection error:'));

// Schema
const Schema = mongoose.Schema;
let urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

// Model
const Url = mongoose.model("Url", urlSchema);

// Executes once connected to DB
db.once("open", function() {
  // Saves URL in DB
  app.post("/api/shorturl", (req, res) => {
    const orgUrl = req.body.url;

    // Checks if the URL that was posted is valid
    if (!isUrl(orgUrl)) {
      res.json({ error: "invalid url" });
    } else {
      Url.estimatedDocumentCount((err, cnt) => {
        if (err) {
          console.log(err);
        } else {
          var url = new Url({
            original_url: orgUrl,
            short_url: cnt + 1
          });

          url.save((err) => {
            if (err) {
              console.log(err);
            }
          });

          res.json({
            original_url: url.original_url,
            short_url: url.short_url
          });
        }
      });
    }
  });

  // Goes to URL 
  app.get("/api/shorturl/:short_url", (req, res) => {
    const shortUrl = req.params.short_url;

    // Finds the correct URL to use
    Url.findOne({ short_url: shortUrl }, (err, url) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect(url.original_url)
      }
    });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
