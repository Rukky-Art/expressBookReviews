const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if(isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

// Add a book review
public_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
   const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session?.authorization?.username;  
  if(!username){
    return res.status(401).json({ message: "User not logged in" });
  }
  else{
    if(books[isbn]){
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added/updated successfully" });
    }
  }
  return res.status(404).json({message: "Book not found"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bookList = await Promise.resolve(Object.values(books));
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const book = await Promise.resolve(books[req.params.isbn]);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const booksByAuthor = await Promise.resolve(Object.values(books).filter(book => book.author === req.params.author));
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const booksByTitle = await Promise.resolve(Object.values(books).filter(book => book.title === req.params.title));
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});


//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const { isbn } = req.params;
    const book = await Promise.resolve(books[isbn]);
    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving reviews" });
  }
});
    
module.exports.general = public_users;
