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

// app.get("/urls", (req, res) => {
//   const templateVars = { urls: urlDatabase };
//   if(req.cookies && req.cookies.username){
//     templateVars.username = req.cookies.username
//       }else {
//         templateVars.username = null
//       }
//   res.render("urls_index", templateVars);
// });

// app.get("/urls/new", (req, res) => {
//   const templateVars = {
//   };
//   if(req.cookies && req.cookies.username){
// templateVars.username = req.cookies.username
//   }else {
//     templateVars.username = null
//   }
//   res.render("urls_new",templateVars);
// });
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };

  if (req.cookies && req.cookies.user_Id) {
    templateVars.user = users[req.cookies.user_Id];
  } else {
    templateVars.user = null;
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {};
  if (req.cookies && req.cookies.user_Id) {
    templateVars.user = users[req.cookies.user_Id];
  } else {
    templateVars.user = null;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const longURL = urlDatabase[shortUrl];
  const templateVars = { id: shortUrl, longURL };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// redirect to long url website once the short url is clicked
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id] ? urlDatabase[id] : "";
  res.redirect(longURL);
});

//delete Url and redirect to urls page
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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  console.log(req.body);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  console.log(req.body);
  res.redirect("/urls");
});

// app.get("/register", (req, res) => {
//   const templateVars = {};
//   if(req.cookies && req.cookies.username){
//     templateVars.username = req.cookies.username
//       }else {
//         templateVars.username = null
//       }
//   res.render("registration", templateVars);
// })

app.get("/register", (req, res) => {
  const templateVars = {};
  if (req.cookies && req.cookies.user_Id) {
    templateVars.user = users[req.cookies.username];
  } else {
    templateVars.user = null;
  }
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const getUserByEmail = function () {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === req.body.email) 
      return true;
    } 
  return false
  };

  if (!req.body.email || !req.body.password) {
    return res.status(400).send("please provide an email and a password");
  } 
   
  if (getUserByEmail()) {
    return res.status(400).send("please provide a different email");
  } else {
    const newUserId = generateRandomString(6);
    users[newUserId] = {};
    res.cookie("user_Id", newUserId);
    users[newUserId]["id"] = newUserId;
    users[newUserId]["email"] = req.body.email;
    users[newUserId]["password"] = req.body.password;
    console.log(users);
    res.redirect("/urls");
  
  }
});
