const path = require("path");
const express = require("express")


const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');
const crypto = require("crypto")
require('dotenv').config();
const secret = process.env.SECRET_KEY

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://japheth:jesutofunmi1234.@cluster0.ggv5oru.mongodb.net/?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file,next) => {
    next(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const fileFilter = (req,file,cb)=>{
 if (file.mimetype === 'image/png'||
     file.mimetype === 'image/jpeg'||
     file.mimetype === 'image/jpg'
 ) {
    cb(null,true)
 } else{
    cb(null,false)
 }
}
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(multer({ storage:fileStorage,fileFilter:fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')))
//app.use()
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
 
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

//console.log("enter")
app.post("/", (req, res,next) => {
  //validate event
  //console.log("Jesus is good")
  //console.log(req.body);
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  console.log(hash);
  //hash == req.headers['x-paystack-signature']
  //console.log(res)
  if (true) {
  // Retrieve the request's body
  console.log("Jesus is good")
  const event = req.body;
  // Do something with event  
  console.log(event)
    
  }
  res.sendStatus(200);
})
app.get('/verify',isAuth,shopController.submitVerify)
app.post('/create-order', isAuth, shopController.postOrder);


app.use(csrfProtection);
app.use((req, res, next) => {
  
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  console.log(error)
  res.redirect('/500');
  /*res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });*/
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log("App on development 1")
    app.listen(3000);
    console.log("App on development 2")
  })
  .catch(err => {
    console.log(err);
  });
