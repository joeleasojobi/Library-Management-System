var express = require('express');
const { redirect } = require('express/lib/response');
const { response } = require('../app');
const { USER_COLLECTION } = require('../config/collection');
const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')


/* GET home page. */
router.get('/', (req, res,next) => {
  let user = req.session.user
  adminHelpers.getBook().then((book) => {
    if(user) {
      res.render('user/viewbooks', { book, user})
    } else {
    res.redirect('/userlogin')
    }
  })
});

router.get('/userlogin', (req, res) => {
  res.render('user/login')
});
router.post('/userlogin', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/viewbooks')
    } else {
      res.redirect('/userlogin')  
    }
  })
})

router.get('/usersignup', (req, res) => {
  res.render('user/signup');
});
router.post('/usersignup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);  
    res.redirect('/userlogin')
  })
});
router.get('/userlogout', (req, res) => {
  req.session.destroy()
  res.redirect('/userlogin');
});

router.get('/viewbooks', (req, res) => {
  let user=req.session.user
  adminHelpers.getBook().then((book) => {
    res.render('user/viewbooks',{book,user})
  })
});
router.get('/bookshelf',async (req, res) => {  
  let user=req.session.user
  let book = await userHelpers.getShelfBooks(req.session.user._id)               
  res.render('user/bookshelf' ,{user,book});
});

router.get('/exceededlimit', (req, res) => {
  let user=req.session.user
  res.render('user/exceededlimit',{user})
});

router.get('/add-to-shelf/:id', async (req, res) => {
  let book = await userHelpers.bookShelfCount(req.session.user._id)
  if (book > 1) {
    res.redirect('/exceededlimit')
    // console.log('Exceeded Limit');
  } else {
    userHelpers.addToBookShelf(req.params.id,req.session.user._id).then(() => {
      res.redirect('/viewbooks')
    })
  }
});

router.get('/return-book/:userid/:bookid', (req, res) => {
  let userId = req.params.userid
  let bookId = req.params.bookid
  console.log(userId);
  console.log(bookId);
  userHelpers.returnBook(userId,bookId).then((response) => {
    res.redirect('/viewbooks')
  })
});

module.exports = router;