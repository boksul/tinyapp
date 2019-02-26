var express = require("express");
var app = express();
var PORT = 8080;
var cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
app.use(cookieParser());


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    username: "test@test"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    username: "a@a"
  }
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
  if (req.cookies["user_email"]){
   urlDatabase[generateRandomString()] = {longURL: req.body.longURL, username: req.cookies["user_email"] }
  }
  // res.send("ok");         // Respond with 'Ok' (we will replace this)
  res.redirect('/urls/');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, userName: req.cookies["user_email"]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let currentUser;
  for (var user in users) {
    if (users[user].email === req.cookies['user_email'])
      currentUser = users[user].email;
  };
  // let userUrls = {}
  // for (var i in urlDatabase) {
  //   if (currentUser === urlDatabase[i].username) {
  //     userUrls["key"] = "value";
  //   }
  // }
  //loop through urlDatabase
  //when username matches urlDatabase username => add to userUrls

  let templateVars = {
  username: currentUser,
  urls: urlDatabase
  //    userUrls
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
  let templateVars = { urls: urlDatabase, username: req.cookies["user_email"] };
  for (let key in urlDatabase) {
    if (key === updateURL && templateVars.username === urlDatabase[key].username) {
      delete urlDatabase[key];
    } else {
      res.sendStatus(403)
    }
  }
  res.render('urls_index', templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let updateURL = req.body.longURL;
  for (let shortURL in urlDatabase) {
    if (shortURL === req.params.shortURL && req.cookies["user_email"] === urlDatabase[shortURL].username) {
      urlDatabase[shortURL].longURL = updateURL;
    }
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userId = req.body.email;
  let userPassword = req.body.password;
  let notLoggedIn = true
  for (var user in users) {
    if (userId === users[user].email && userPassword === users[user].password) {
      res.cookie('user_email', userId)
      res.redirect('/urls');
      notLoggedIn = false
    }
  }
  if (notLoggedIn){
      res.sendStatus(403)
    }
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  res.render('urls_login')
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_email');
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
    res.cookie('user_email', randomId);
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: req.body.password
    };
    res.redirect('/urls')
  }
});

