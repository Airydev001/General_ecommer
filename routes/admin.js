const path = require('path');

const {body}=require('express-validator/check')
const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth,
[body("title","The title must be long, and enter correct format")
.isString()
.isLength({min:7})
.trim(),
body("price").isFloat(),
body("description")
.trim()
.isLength({min:8,max:300})
],
adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, [
body("title")
.isString()
.isLength({min:7})
.trim(),
body("price").isFloat(),
body("description")
.isLength({min:8,max:300})
], adminController.postEditProduct);

router.post('/delete-product', isAuth,adminController.postDeleteProduct);

module.exports = router;
