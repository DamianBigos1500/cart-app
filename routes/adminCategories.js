const express = require('express')
const { body, validationResult } = require('express-validator');
// Get model
const Category = require('../models/category')

const router = express.Router()

//
// GET admin category index
//
router.get('/', (req, res) => {
  Category.find((err, categories) => {
    if(err)
      return console.log(err)
      
    res.render('admin/categories', {
      categories: categories
    })
  })
})


/*
* GET add category
*/
router.get('/add-category', (req, res) => {
  
  const title = ''

  res.render('admin/addCategory', {
    title: title,
  })
})

//
// post add categry
//
router.post('/add-category',
  body('title', 'Title must have a value').notEmpty(),
  body('title', 'Title min lingth is 4').isLength({ min: 4 }),
  (req, res) => {

  let title = req.body.title
  let slug = title.replace(/\+a+/g, '-').toLowerCase()
  
  let errors = validationResult(req)

  if(!errors.isEmpty()) {
    res.render('admin/addCategory', {
      errors: errors.array(),
      title: title,
    })
  }
  else {
    Category.findOne({slug: slug}, (err, category) => {
      if(category) {
        req.flash('danger', 'Category title exists, choose another.')
        res.render('admin/addCatygory', {
          title: title,
        })
      }
      else {

        const category = new Category({
          title: title,
          slug: slug,
        })

        category.save((err) => {
          if (err)
            return console.log(handleError(err));

          req.flash('success', 'Category added')
          res.redirect('/admin/categories')
        })
      }
    })
  }
})

/*
* GET edit category
*/
router.get('/edit-category/:id', (req, res) => {
  
  Category.findById(req.params.id, (err, category) => {
    if(err)
      return console.log(err)

    res.render('admin/editCategory', {
      title: category.title,
      id: category._id
    })
  })
})

/*
* POST edit category
*/
router.post('/edit-category/:id',
  body('title', 'Title must have a value').notEmpty(),
  body('title', 'Title min lingth is 4').isLength({ min: 4 }),
  (req, res) => {

  let title = req.body.title
  let slug = title.replace(/\+a+/g, '-').toLowerCase()
  let id = req.params.id

  let errors = validationResult(req)

  if(!errors.isEmpty()) {
    res.render('admin/editCategory', {
      errors: errors.array(),
      title: title,
      id: id
    })
  }
  else {
    Category.findOne({slug: slug, _id: {'$ne': id}}, (err, category) => {
      if(category) {
        req.flash('danger', 'Category title exists, choose another.')
        res.render('admin/editCategory', { 
          title: title,
          id: id
        })
      }
      else {

        Category.findById(id, (err, category) => {
          if(err) 
            return console.log(err)

          category.title = title
          category.slug = slug

          category.save((err) => {
            if (err)
              return console.log(handleError(err));
  
            req.flash('success', 'Category editted')
            res.redirect('/admin/categories/edit-category/' + id)
          })
        })
  
      }
    })
  }
})

//
// GET delete category
//
router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err) => {
    if (err)
      return console.log(handleError(err));

    req.flash('success', 'Category deleted')
    res.redirect('/admin/categories/')
  })
})

// Exports 
module.exports = router