const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(cookieParser());

const generateRandomString = function (length) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUserByEmail = function (email) {   
  let foundUser = null  
  for (const userId in users) {
  const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  return foundUser
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };

  if (req.cookies && req.cookies.userId ) {
    templateVars.user = users[req.cookies.userId];
  } else {
    templateVars.user = null;
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user:users[req.cookies.userId]}
  if (!req.cookies.userId) {
    res.redirect("/login");
  } else {
    res.render("urls_new",templateVars)
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies.userId) {
    res.redirect("/login"); 
  } else {
  const shortUrl = req.params.id;
  const longURL = urlDatabase[shortUrl];
  const templateVars = { id: shortUrl, longURL, user:users[req.cookies.userId] };
  res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!req.cookies.userId) {
    res.status(400).send("Cannot shorten Url, please login first")
  } else {
    console.log(req.body); // Log the POST request body to the console
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = req.body.longURL;
    res.redirect(`/urls/${shortUrl}`);
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
  console.log(urlDatabase)
  }
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id] ? urlDatabase[id] : res.status(400).send("shortened url is not present in the URL database");
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
});



app.get("/register", (req, res) => {
  const templateVars = {user:users[req.cookies.userId]}
  if (!req.cookies.userId) {
    res.render("registration",templateVars)
  } else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(users)
  if (!email  || !password) {
    return res.status(400).send("please provide an email and a password");
  }
  
  const foundUser = getUserByEmail(email)
  if (foundUser) {
    
    return res.status(400).send("please provide a different email");
  } else {
    const newUserId = generateRandomString(6);
    users[newUserId] = {};
    //res.cookie('userId', newUserId);
    users[newUserId]["id"] = newUserId;
    users[newUserId]["email"] = req.body.email;
    users[newUserId]["password"] = req.body.password;
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {user:users[req.cookies.userId]}
  if (!req.cookies.userId) {
    res.render("login",templateVars)
  } else {
    res.redirect("/urls");
  }

});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("please provide an email and a password");
  }
  
  const foundUser = getUserByEmail(email)
  if (!foundUser) {
    return res.status(403).send("e-mail cannot be found");
  }
 
  if (foundUser.password !== password) {
    return res.status(403).send("password does not match");
  }
  res.cookie('userId',foundUser.id)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
res.clearCookie("userId");
res.redirect("/login");
});
