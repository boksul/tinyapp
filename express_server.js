var express = require("express");
var app = express();
var PORT = 8080;
var cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
app.use(cookieParser());


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let unique = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    unique += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return unique;
};




app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {  // Log the POST request body to the console
  const newShortURL = generateRandomString()
  urlDatabase[generateRandomString()] = req.body.longURL
  console.log("urlDatabase", urlDatabase)
  // res.send("ok");         // Respond with 'Ok' (we will replace this)
  res.redirect('/urls/'+newShortURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, userName: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
  username: req.cookies["username"],
  urls: urlDatabase
  // ... any other vars
  };
res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL].url;
    urlDatabase[shortURL].counter++;
    res.redirect(longURL);
  } else {
    res.sendStatus(400);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let updateURL = req.params.shortURL;
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  for (let key in urlDatabase) {
    if (key === updateURL) {
      delete urlDatabase[key];
    }
  }
  res.render('urls_index', templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let editURL = req.params.shortURL;
  for (let key in urlDatabase) {
    if (key === editURL) {
      res.redirect("/urls/"+key);
    }
  }
  res.redirect("/urls/"+key);
});

app.post("/urls/:shortURL", (req, res) => {
  let updateURL = req.params.shortURL;
  for (let key in urlDatabase) {
    if (key === updateURL) {
      urlDatabase[key].url = req.body['longURL'];
    }
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userId = req.body.username;
  // let randNum = generateRandomString();
  res.cookie('username', userId);
  console.log(`username = ${req.body.username}`);
  //redirect to urls_index page
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.post('/logout', (req, res) => {

  req.session = null;
  res.redirect("/urls");

});
