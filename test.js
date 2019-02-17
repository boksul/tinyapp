var express = require("express");
var app = express();
var PORT = 8080;
var cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
app.use(cookieParser());

const users = {
  "user": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

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

  if(req.session.user_id) {
    let key = checkUserLogin(req.session.user_id);
    let templateVars = { users: req.session.user_id, userEmail: user[key].email,};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  let key = checkUserLogin(req.session.user_id);
  let templateVars = { urls: urlDatabase, users: req.session.user_id, userEmail: user[key].email, };
  res.render("urls_index", templateVars);

});

app.get("/urls/:id", (req, res) => {

  if(urlDatabase[req.params.id]) {
    if(req.session.user_id) {
      if(req.session.user_id === urlDatabase[req.params.id].userID) {
        let key = checkUserLogin(req.session.user_id);
        let templateVars = { shortURL: req.params.id, urls: urlDatabase, users: req.session.user_id, userEmail: user[key].email,};
        res.render("urls_show", templateVars);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.redirect("/login");
    }
  } else {
    res.sendStatus(400);
  }

});

app.get("/register", (req, res) => {
  let templateVars = { userID: req.session.users.id, registryError: req.session.registryError };
  res.session = null;
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {

  let check = checkUserRegisterContent(user, req.body.email, req.body.password);
  if(check === "goodPassword") {
    let userID = generateRandomString();
    let userData = {};
    userData["id"] = userID;
    userData["email"] = req.body.email;
    userData["password"] = bcrypt.hashSync(req.body.password, 10);
    user[userID] = userData;
    req.session.user_id = user[userID].id;
    res.redirect("/urls");
  } else if (check === "badPassword") {
    res.sendStatus(400);
  }

});

app.post("/urls/:id/delete", (req, res) => {

  let updateURL = req.params.id;
  for (let key in urlDatabase) {
    if (key === updateURL) {
      delete urlDatabase[key];
    }
  }
  res.redirect("/urls");

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

  let check = checkUserLoginContent(user, req.body.email, req.body.password);
  if(check !== "badUserLogin") {
    //res.cookie("user_id", users[check].id);
    req.session.user_id = user[check].id;
    res.redirect("/urls");
  }else if (check === "badUserLogin") {
    res.sendStatus(403);
  }

});

app.post('/logout', (req, res) => {

  req.session = null;
  res.redirect("/urls");

});
