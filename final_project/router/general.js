const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
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
    const response = await axios.get(`${BASE_URL}/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${req.params.author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${req.params.title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const book = await Promise.resolve(books[req.params.isbn]);
    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving reviews" });
  }
});

// Add a book review
public_users.put("/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review || req.body.review;
  const username = req.query.username || req.body.username;
  if (!username || !review) {
    return res.status(400).json({ message: "Username and review are required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review
public_users.delete("/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.query.username || req.body.username;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.general = public_users;
