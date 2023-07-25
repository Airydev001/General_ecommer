
const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);
//router.get('/verify',isAuth,shopController.submitVerify)
//routrser.get('/?trxref={transaction}&reference={reference}',isAuth, shopController.confirmPayment)
router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);


router.get('/checkout',isAuth,shopController.getCheckOut)

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth,shopController.getInvoice)
module.exports = router;
//2FDGbDgxApta2kDSdiKBc90Tz73_2QDV1jakKmD5K3ZNPLnqY