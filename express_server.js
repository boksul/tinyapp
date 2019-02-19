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


const users = {};

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

  // res.send("ok");         // Respond with 'Ok' (we will replace this)
  res.redirect('/urls/');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, userName: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let currentUser;
  for (var user in users) {
    if (user === req.cookies['user_id'])
      currentUser = users[user].email;
  };

  let templateVars = {
  username: currentUser,
  urls: urlDatabase
  // ... any other vars
  };

res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL/edit", (req, res) => {
  let templateVars = { shortURL: req.params };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let updateURL = req.params.shortURL;
  let templateVars = { urls: urlDatabase, username: req.cookies["user_id"] };
  for (let key in urlDatabase) {
    if (key === updateURL) {
      delete urlDatabase[key];
    }
  }
  res.render('urls_index', templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let updateURL = req.body.longURL;
  for (let shortURL in urlDatabase) {
    if (shortURL === req.params.shortURL) {
      urlDatabase[shortURL] = updateURL;
    }
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userId = req.body.email;
  let userPassword = req.body.password;
  for (var user in users) {
    if (userId === users[user].email && userPassword === users[user].password) {
      res.cookie('user_id', user)
      res.redirect('/urls');
    } else {
      res.sendStatus(403)
    }
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  res.render('urls_login')
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  res.render('urls_registration')
});

app.post('/register', (req, res) => {
  var randomId = generateRandomString();
  let userExist = false;
  for (var user in users) {
    if (users[user].email === req.body.email) {
      userExist = true;
    }
  };

  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  } else if (userExist) {
    res.sendStatus(400);
  } else {
    res.cookie('user_id', randomId);
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: req.body.password
    };
    res.redirect('/urls')
  }
});





























