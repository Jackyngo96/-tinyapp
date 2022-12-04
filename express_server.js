const getUserByEmail = require("./helpers")
const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
app.set("view engine", "ejs");
app.use(cookieSession({ name: "session", secret: "secret" }));

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



const urlsForUser = function (userId) {
  const filterUrl = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userId) {
      filterUrl[id] = urlDatabase[id];
    }
  }
  return filterUrl;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
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
  if (!req.session.userId) {
    res.status(400).send("Please login first 1");
  } else {
    const user = users[req.session.userId];
    const filteredDataBase = urlsForUser(req.session.userId);
    const templateVars = { urls: filteredDataBase, user: user };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    res.status(400).send("Cannot shorten Url, please login first");
  } else {
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.session.userId,
    };
    res.redirect(`/urls/${shortUrl}`);
    res.send("Ok");
  }
});

//CREATE NEW URL//
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const userId = req.session.userId;
  if (!req.session.userId) {
    return res.status(400).send("Please login first");
  }
  if (req.session.userId && !urlDatabase[shortUrl]) {
    return res.status(400).send("Url does not exist");
  }

  if (
    req.session.userId &&
    urlDatabase[shortUrl] &&
    urlDatabase[shortUrl].userID !== userId
  ) {
    return res.status(400).send("Cannot access URL");
  }

  const longURL = urlDatabase[shortUrl]["longURL"];
  const templateVars = {
    id: shortUrl,
    longURL,
    user: users[req.session.userId],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
    ? urlDatabase[id]["longURL"]
    : res.status(400).send("shortened url is not present in the URL database");
  res.redirect(longURL);
});

//DELETE//
app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id;
  const userId = req.session.userId;
  if (req.session.userId && !urlDatabase[shortUrl]) {
    return res.status(400).send("Url does not exist");
  }

  if (!req.session.userId) {
    return res.status(400).send("Please login first");
  }

  if (
    req.session.userId &&
    urlDatabase[shortUrl] &&
    urlDatabase[shortUrl].userID !== userId
  ) {
    return res.status(400).send("Cannot access URL");
  }
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

//EDIT//
app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const userId = req.session.userId;
  if (req.session.userId && !urlDatabase[shortUrl]) {
    return res.status(400).send("Url does not exist");
  }

  if (!req.session.userId) {
    return res.status(400).send("Please login first");
  }

  if (
    req.session.userId &&
    urlDatabase[shortUrl] &&
    urlDatabase[shortUrl].userID !== userId
  ) {
    return res.status(400).send("Cannot access URL");
  }

  urlDatabase[shortUrl]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

//REGISTER//
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  if (!req.session.userId) {
    res.render("registration", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("please provide an email and a password");
  }

  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send("please provide a different email");
  } else {
    const newUserId = generateRandomString(6);
    users[newUserId] = {};
    users[newUserId]["id"] = newUserId;
    users[newUserId]["email"] = email;
    users[newUserId]["password"] = hashedPassword;
    res.redirect("/login");
  }
});

//LOGIN//
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  if (!req.session.userId) {
    res.render("login", templateVars);
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

  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    return res.status(403).send("e-mail cannot be found");
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("password does not match");
  }
  req.session.userId = foundUser.id;
  res.redirect("/urls");
});

//LOGOUT//
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
