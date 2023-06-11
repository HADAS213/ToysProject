// getting-started.js
const mongoose = require('mongoose');
const {config} = require('../config/secret');

main().catch(err => console.log(err));

async function main() {
  // await mongoose.connect('mongodb://127.0.0.1:27017/black23');
  await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@cluster0.k0svbyg.mongodb.net/black23`);
  console.log("connect")

}