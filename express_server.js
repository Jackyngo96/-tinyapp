const bcrypt = require("bcryptjs");
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
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  return foundUser;
};

const urlsForUser = function (userId) {
  const filterUrl = {};
  console.log("in url for user");
  console.log(userId);
  for (const id in urlDatabase) {
    console.log(urlDatabase[id]);
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
  if (!req.cookies.userId) {
    res.status(400).send("Pleas login first");
  } else {
    const user = users[req.cookies.userId];
    const filteredDataBase = urlsForUser(req.cookies.userId);
    console.log(filteredDataBase);
    const templateVars = { urls: filteredDataBase, user: user };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!req.cookies.userId) {
    res.status(400).send("Cannot shorten Url, please login first");
  } else {
    console.log(req.body);
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.cookies.userId,
    };
    res.redirect(`/urls/${shortUrl}`);
    res.send("Ok");
    console.log(urlDatabase);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  if (!req.cookies.userId) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const userId = req.cookies.userId;
  if (!req.cookies.userId) {
    return res.status(400).send("Please login first");
  } 
  if (req.cookies.userId && !urlDatabase[shortUrl]){ 
    return res.status(400).send("Url does not exist");
  }
  
  if (req.cookies.userId && urlDatabase[shortUrl] && urlDatabase[shortUrl].userID !== userId) {
    return res.status(400).send("Cannot access URL");
  }
    
  const longURL = urlDatabase[shortUrl]["longURL"];
  const templateVars = {
    id: shortUrl,
    longURL,
    user: users[req.cookies.userId],
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

app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id;
  const userId = req.cookies.userId
  if (req.cookies.userId && !urlDatabase[shortUrl]){ 
    return res.status(400).send("Url does not exist")
  }
  
  if (!req.cookies.userId) {
    return res.status(400).send("Please login first");
  } 
  
  if (req.cookies.userId && urlDatabase[shortUrl] && urlDatabase[shortUrl].userID !== userId) {
    return res.status(400).send("Cannot access URL");
  }
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});
//EDIT ENDPOINT//
app.post("/urls/:id", (req, res) => {
  const shortUrl= req.params.id;
  const userId = req.cookies.userId
  if (req.cookies.userId && !urlDatabase[shortUrl]){ 
    return res.status(400).send("Url does not exist")
  }
  
  if (!req.cookies.userId) {
    return res.status(400).send("Please login first");
  } 
  
  if (req.cookies.userId && urlDatabase[shortUrl] && urlDatabase[shortUrl].userID !== userId) {
    return res.status(400).send("Cannot access URL");
  }
  
  urlDatabase[shortUrl]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  if (!req.cookies.userId) {
    res.render("registration", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//REGISTER ENDPOINT//
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(users);
  if (!email || !password) {
    return res.status(400).send("please provide an email and a password");
  }

  const foundUser = getUserByEmail(email);
  if (foundUser) {
    return res.status(400).send("please provide a different email");
  } else {
    const newUserId = generateRandomString(6);
    users[newUserId] = {};
    users[newUserId]["id"] = newUserId;
    users[newUserId]["email"] = email;
    users[newUserId]["password"] = bcrypt.hashSync(password,10);
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  if (!req.cookies.userId) {
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

  const foundUser = getUserByEmail(email);
  if (!foundUser) {
    return res.status(403).send("e-mail cannot be found");
  }

  if (foundUser.password !== password) {
    return res.status(403).send("password does not match");
  }
  res.cookie("userId", foundUser.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login");
});
