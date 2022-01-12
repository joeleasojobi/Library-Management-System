var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
const { ADMIN_COLLECTION } = require('../config/collection');
const adminHelpers = require('../helpers/admin-helpers')
const userHelpers = require('../helpers/user-helpers')
var objectId = require('mongodb').ObjectId

/* GET home page. */
router.get('/', (req, res,next) => {
  res.redirect('/admin/login')  
});

router.get('/login', (req, res) => {
  res.render('admin/login');
});

router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.admin = response.admin
      let admin=req.session.admin
      res.redirect('/admin/viewbook')
    } else {
      res.redirect('/admin/login')
    }
  })
})

router.get('/signup', (req, res) => {
  res.render('admin/signup')
});

router.post('/signup', (req, res) => {
  adminHelpers.doSignup(req.body).then((response) => {
    console.log(response);  
    res.redirect('/admin/login')
  })
});

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin/login');
});

router.get('/viewbook', (req, res) => {
  let admin=req.session.admin
  adminHelpers.getBook().then((book) => {
    res.render('admin/viewbook',{book,admin})
  })
});

router.get('/member',async (req, res) => {
  let admin=req.session.admin
  adminHelpers.getMember().then((user) => {
    res.render('admin/member',{admin,user})
  })
});

router.get('/shelf/:id', (req, res) => {
  let admin=req.session.admin
  userHelpers.getShelfBooks(req.params.id).then((shelf) => {
    res.render('admin/shelf',{shelf,admin})
  })
})

router.get('/addbook', (req, res) => {
  let admin=req.session.admin
  res.render('admin/addbook',{admin})
});

router.post('/addbook', (req, res) => {
  adminHelpers.addBook(req.body).then((response) => {
    res.redirect('/admin/viewbook')
  })
});

router.get('/editbook/:id', async (req, res) => {
  admin = req.session.admin
  let book = await adminHelpers.getBookDetails(req.params.id)
  console.log(book);
  res.render('admin/editbook', { book,admin })
});

router.post('/editbook/:id', (req, res) => {
  admin = req.session.admin
  adminHelpers.updateBook(req.params.id, req.body).then(() => {
    res.redirect('/admin/viewbook')
  })
})

router.get('/delete-book/:id', (req, res) => {
  let bukId = req.params.id
  console.log(bukId);
  adminHelpers.deleteBook(bukId).then((response) => {
    res.redirect('/admin/viewbook')
  })
})

module.exports = router;