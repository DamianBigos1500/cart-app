const express = require('express')
const { body, validationResult, check } = require('express-validator');
const mkdirp = require('mkdirp')
const fs = require('fs-extra')
const resizeImg = require('resize-img')

// Include fs
const fsPromises = require('fs').promises

// Get model
const Product = require('../models/product')
const Category = require('../models/category')
const router = express.Router()

//
// GET products index 
//
router.get('/', (req, res) => {
  let count = 1

  async() => {await Product.count((err, c) => {
    count = c
  })
  }

  Product.find((err, products) => {
    res.render('admin/products', {
      products: products,
      count: count
    })
  })
})

//
// GET add product
//
router.get('/add-product', (req, res) => {
  
  const title = ''
  const desc = ''
  const price = ''

  Category.find((err, categories) => {
    res.render('admin/addProduct', {
      title: title,
      desc: desc,
      categories: categories,
      price: price
    })
  })
})

//
// POST add product
//
router.post('/add-product',
  [
  body('title', 'Title must have a value').notEmpty(),
  body('title', 'Title min lingth is 4').isLength({ min: 4 , max: 20}),
  body('desc', 'Description must have a value').notEmpty(),
  body('price', 'Price must have a value').isDecimal(),
],
  (req, res) => {
    // check image  
      let imageFile = req.files !== null ? req.files.image.name : ''



  // body('image', 'You must upload an image').custom((value, filename) => {
  //   const extension = (path.extname(filename)).toLowerCase(imageFile)
  //   switch(extension) {
  //     case '.jpg':
  //       return '.jpg';
  //     case '.jpeg':
  //       return '.jpeg';
  //     case '.png':
  //       return '.png';
  //     case '':
  //       return '.jpg';
  //     default:
  //       return false;
  //   }
  // })

  //
  let title = req.body.title
  let slug = title.replace(/\+a+/g, '-').toLowerCase()
  let desc = req.body.desc
  let price = req.body.price
  let category = req.body.category

  
  let errors = validationResult(req)

  if(!errors.isEmpty()) {
    console.log(errors)
    Category.find((err, categories) => {
      res.render('admin/addProduct', {
        errors: errors.array(),
        title: title,
        desc: desc,
        categories: categories,
        price: price
      })
    })
  }
  else {

    Product.findOne({slug: slug}, (err, product) => {
      if(product) {
        req.flash('danger', 'Product title exists, choose another.')
        Category.find((err, categories) => {
          res.render('admin/addProduct', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
          })
        })
      }
      else {
        const price2 = parseFloat(price).toFixed(2)
        const product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          category: category,
          image: imageFile
        })

        product.save((err) => {
          if (err){
            return console.log(handleError(err));
          }

          fsPromises.mkdir('public/product_images/' + product.id).then(function() {
            console.log('Directory created successfully');
          }).catch(function() {
              console.log('failed to create directory');
          });

          fsPromises.mkdir('public/product_images/' + product._id + '/gallery').then(function() {
            console.log('Directory created successfully');
          }).catch(function() {
              console.log('failed to create directory');
          });

          fsPromises.mkdir('public/product_images/' + product._id + '/gallery/thumbs').then(function() {
            console.log('Directory created successfully');
          }).catch(function() {
              console.log('failed to create directory');
          });

          if(imageFile != '') {
            const productImage = req.files.image
            const path = 'public/product_images/'  +  product._id +  '/' + product.image

            console.log(path)

            productImage.mv(path)
            .then((result) => {
              console.log(result)
            })
            .catch((err) => {
              console.log(err)
            })
          }

          req.flash('success', 'Product added')
          res.redirect('/admin/products')
        })
      }
    })
  }
})

//
// GET edit product
//
router.get('/edit-product/:id', (req, res) => {
  
  let errors

  if(req.session.errors) errors = req.session.errors
  req.session.errors = null


  Category.find((err, categories) => {

    Product.findById(req.params.id, (err, p) => {
      if(err){
        console.log(err)
        res.redirect('/admin/products')
      } else {
        const galleryDir = 'public/product_images/' + p._id + '/gallery'
        let galleryImages = null

        fs.readdir(galleryDir, (err, files) => {
          if(err) {
            console.log(err)
          } else {
            galleryImages = files

            res.render('admin/editProduct', {
              title: p.title,
              errors: errors,
              desc: p.desc,
              categories: categories,
              category: p.category.replace(/\s+/g).toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id
            })
          }
        })
      }

    })
  })
})

/*
* POST edit page
*/
router.post('/edit-product/:id',
  body('title', 'Title must have a value').notEmpty(),
  body('title', 'Title min lingth is 4').isLength({ min: 4 }),
  body('content', 'Content must have a value').notEmpty(),
  (req, res) => {

  let title = req.body.title
  let slug = req.body.slug.replace(/\+a+/g, '-').toLowerCase()
  if(slug == '') slug = req.body.title.replace(/\+a+/g, '-').toLowerCase()
  let content = req.body.content
  let id = req.params.id

  let errors = validationResult(req)

  if(!errors.isEmpty()) {
    res.render('admin/addPage', {
      errors: errors.array(),
      title: title,
      slug: slug,
      content: content,
      id: id
    })
  }
  else {
    Page.findOne({slug: slug, _id: {'$ne': id}}, (err, page) => {
      if(page) {
        req.flash('danger', 'Page slug exists, choose another.')
        res.render('admin/editPage', {
          title: title,
          slug: slug,
          content: content,
          id: id
        })
      }
      else {

        Page.findById(id, (err, page) => {
          if(err) 
            return console.log(err)
          
          page.title = title
          page.slug = slug
          page.content = content

          page.save((err) => {
            if (err)
              return console.log(handleError(err));
  
            req.flash('success', 'Page editted')
            res.redirect('/admin/pages/edit-page/' + id)
          })
        })

  
      }
    })
  }
})


//
// POST product gallery
//
router.post('/product-gallery/:id', (req, res) => {
  let productImage = req.files.file
  let id = req.params.id

  console.log(productImage)
  const path = 'public/product_images/' + id + '/gallery' + req.files.file.name
  console.log(path)
  const thumbPath = 'public/product_images/' + id + '/gallery/thumbs' + req.files.file.name

  productImage.mv(path)
  .then((result) => {
    console.log(result)
  })
  .catch((err) => {
    console.log(err)
  })

})

//
// GET delete page
//
router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if (err)
      return console.log(handleError(err));

    req.flash('success', 'Page deleted')
    res.redirect('/admin/pages/')
  })
})

// Exports 
module.exports = router