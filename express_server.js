const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

function generateRandomString(length) {
 let result           = '';
 let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 let charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});  

app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id
  const longURL = urlDatabase[shortUrl]
  const templateVars = { id: shortUrl, longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortUrl = generateRandomString(6)
  urlDatabase[shortUrl] = req.body.longURL
  res.redirect(`/urls/${shortUrl}`)
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// redirect to long url website once the short url is clicked
app.get("/u/:id", (req, res) => {
 const id = req.params.id
 const longURL = urlDatabase[id]? urlDatabase[id]: ""
 res.redirect(longURL);
}); 

//delete Url and redirect to urls page
app.post("/urls/:id/delete", (req, res) => { 
const id = req.params.id
delete urlDatabase[id]
res.redirect("/urls")
});