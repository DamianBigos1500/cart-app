const express = require('express')
const { body, validationResult } = require('express-validator');
// Get model
const Category = require('../models/category')

const router = express.Router()

//
// get admin page
//
router.get('/', (req, res) => {
  res.send('cats index')
  // Page.find({}).sort({sorting: 1}).exec((err, pages) => {
  //   res.render('admin/pages', {
  //     pages: pages
  //   })
  // })
})

router.get('/add-page', (req, res) => {
  
  const title = ''
  const slug = ''
  const content = ''

  res.render('admin/addPage', {
    title: title,
    slug: slug,
    content: content
  })
})

//
// post add page
//
router.post('/add-page',
  body('title', 'Title must have a value').notEmpty(),
  body('title', 'Title min lingth is 4').isLength({ min: 4 }),
  body('content', 'Content must have a value').notEmpty(),
  (req, res) => {

  let title = req.body.title
  let slug = req.body.slug.replace(/\+a+/g, '-').toLowerCase()
  if(slug == '') slug = req.body.title.replace(/\+a+/g, '-').toLowerCase()
  let content = req.body.content

  
  let errors = validationResult(req)

  if(!errors.isEmpty()) {
    console.log(errors)
    res.render('admin/addPage', {
      errors: errors.array(),
      title: title,
      slug: slug,
      content: content
    })
  }
  else {
    Page.findOne({slug: slug}, (err, page) => {
      if(page) {
        req.flash('danger', 'Page slug exists, choose another.')
        console.log(page)
        res.render('index', {
          title: title,
          slug: slug,
          content: content
        })
      }
      else {

        const page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 0
        })

        page.save((err) => {
          if (err)
            return console.log(handleError(err));

          req.flash('success', 'Page added')
          res.redirect('/admin/pages')
        })
      }
    })
  }
})


/*
* post reorder pages
*/ 

router.post('/reorder-pages', (req, res) => {
  console.log(req.body)
  const ids = req.body['id[]']

  let count = 0

  for (let i = 0; i < ids.length; i++) {
    let id = ids[i]
    count++

    (function(count) {
      Page.findById(id, (err, page) => {
        page.sorting = count
        page.save((err) => {
          if(err)
            return console.log(err)
        })
      })
    })(count)

  }
})

/*
* get edit page
*/
router.get('/edit-page/:slug', (req, res) => {
  
  Page.findOne({slug: req.params.slug}, (err, page) => {
    if(err)
      return console.log(err)

    res.render('admin/editPage', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    })
  })
})

/*
* post edit page
*/
router.post('/edit-page/:slug',
  body('title', 'Title must have a value').notEmpty(),
  body('title', 'Title min lingth is 4').isLength({ min: 4 }),
  body('content', 'Content must have a value').notEmpty(),
  (req, res) => {

  let title = req.body.title
  let slug = req.body.slug.replace(/\+a+/g, '-').toLowerCase()
  if(slug == '') slug = req.body.title.replace(/\+a+/g, '-').toLowerCase()
  let content = req.body.content
  let id = req.body.id

  
  let errors = validationResult(req)

  if(!errors.isEmpty()) {
    console.log(errors)
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
        console.log(page)
        res.render('admin/editPage', { //i don't need slug after link
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
            res.redirect('/admin/pages/edit-page/'+page.slug)
          })
        })

  
      }
    })
  }
})

//
// get admin page
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