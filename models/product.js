const mongoose = require('mongoose')

// Product Schema
const ProductSchema = {
  title: {
    type: String,
    require: true
  },
  slug: {
    type: String
  },
  desc: {
    type: String,
    require: true
  },
  category: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  image: {
    type: String
  }
}

const Product = mongoose.model('Produkt', ProductSchema)

module.exports = Product;