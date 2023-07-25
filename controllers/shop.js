const Product = require('../models/product');
const Order = require('../models/order');
const path = require('path');
const fs = require("fs")
const PDFDocument= require("pdfkit")
const https = require('https');
let Cryptos = require('crypto');
const express= require ("express");
const app = express()
require('dotenv').config();
const secret = process.env.SECRET_KEY;

const NUMBER_ITEMS_PER_PAGE= 1;

exports.getProducts = (req, res, next) => {
  
  const page =  +req.query.page || 1
  let totalItems;
  //console.log(page)
  Product.find().count().then(numberProducts=>{
     totalItems = numberProducts
    return Product.find().skip((page - 1) * NUMBER_ITEMS_PER_PAGE)
  .limit(NUMBER_ITEMS_PER_PAGE)
  } )
  .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products',
        currentPage:page,
        hasNextPage : NUMBER_ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage : page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage:Math.ceil(totalItems / NUMBER_ITEMS_PER_PAGE)
      })
    })
    .catch(err => {
      {const error = new Error(err)
        //error.httpStatusCode = 500;
        return next(err)}
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {const error = new Error(err)
      //error.httpStatusCode = 500;
      console.log(error)
      return next(err)});
};

exports.getIndex = (req, res, next) => {
  const page =  +req.query.page || 1
  let totalItems;
  //console.log(page)
  Product.find().count().then(numberProducts=>{
     totalItems = numberProducts
    return Product.find().skip((page - 1) * NUMBER_ITEMS_PER_PAGE)
  .limit(NUMBER_ITEMS_PER_PAGE)
  } )
  .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage:page,
        hasNextPage : NUMBER_ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage : page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage:Math.ceil(totalItems / NUMBER_ITEMS_PER_PAGE)
      })
    }).catch(err => {
      const error = new Error(err)
      //error.httpStatusCode = 500;
      return next(err)
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
   
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {const error = new Error(err)
    //error.httpStatusCode = 500;
    return next(err)});
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};
exports.submitVerify = (req,res,next)=>{
  //console.log(req.user.tr)
 /*let hasError = false
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/:${req.user.transactionRef}`,
    method: 'GET',
    headers: {
      Authorization: 'Bearer sk_test_466025b2af65b9d6513b0007c4feabbee72aa2e3'
    }
  }
  
https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', (err) => {
    console.log(JSON.parse(data))
    const receiveData = JSON.parse(data);
    
    console.log(req.headers)
      
    console.log("it was successful")
    const parameter = req.query;
    console.log(parameter);
   
  

  })
}).on('error', error => {
  hasError = true;
  console.log(error)
})*/
res.render('shop/verify', {
  path: '/verify',
  pageTitle: 'Verification page',
  message:  "Your payment was Sucessful",
  hasError:false
});
const reference =req.query.reference;
const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: `/transaction/verify/:dfufo3kef0`,
  method: 'GET',
  headers: {
    Authorization: `Bearer ${secret}`
  }
}

https.request(options, res => {
let data = ''

res.on('data', (chunk) => {
  data += chunk
});

res.on('end', (err) => {
  console.log(JSON.parse(data))
  const receiveData = JSON.parse(data);
  
  console.log(req.headers)
    
  console.log("it was successful")
  const parameter = req.query;
  console.log(parameter);
 


})
}).on('error', error => {
//hasError = true;
console.log(error)
})

/* Using Express
app.post("/transaction/initialize", function(req, res) {
    //validate event
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
    // Retrieve the request's body
    const event = req.body;
    // Do something with event  
    console.log(event)
    }
    
})*/
}
exports.getCheckOut = (req,res,next)=>{
  req.user
    .populate('cart.items.productId')
   
    .then(user => {
      const products = user.cart.items;
      let total = 0
      products.forEach(p => {
         total += p.quantity * p.productId.price
      })
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Check out page',
        products: products,
        totalSum: total,
        cartId: user._id,
        email:user.email

      });
    })
    .catch(err => {const error = new Error(err)
    //error.httpStatusCode = 500;
    return next(err)});
}
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {const error = new Error(err)
      //error.httpStatusCode = 500;
      return next(err)});
};

exports.postOrder = (req, res, next) => {
  
  let email = '';
  req.user
    .populate('cart.items.productId')
    .then(user => {
      
      email += user.email;
      let totalSum = 0;
      user.cart.items.forEach(p=>{
        
        totalSum += p.quantity * p.productId.price * 100})
      console.log(totalSum)
      
console.log(email)
const params = JSON.stringify({
  "email": email,
  "amount": totalSum
})

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/transaction/initialize',
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
}

const request = https.request(options, response => {
  let data = ''
  
  response.on('data', (chunk) => {
    data += chunk
  
  });

  response.on('end', (err) => {
    console.log(JSON.parse(data))
    const datas = JSON.parse(data)
    const uri = datas.data.authorization_url;
    req.user.transactionRef=datas.data.reference;
    req.user.save()
      res.redirect(uri);
      return;
  })
}).on('error', err => {
  const error = new Error(err)
      //error.httpStatusCode = 500;
      return next(err)
})
request.write(params)
request.end()
      
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      console.log(result);
      return req.user.clearCart();
    })
    .then(() => {
     
      //return res.redirect('/orders')
    })
    .catch(err => {const error = new Error(err)
      //error.httpStatusCode = 500;
      return next(err)});
};
exports.confirmPayment=(req,res,next)=>{
  const transaction = req.query;
  console.log(transaction);
  
}
exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {const error = new Error(err)
      //error.httpStatusCode = 500;
      return next(err)});
};
exports.getInvoice = (req,res,next)=>{
const orderId = req.params.orderId;
Order.findById(orderId).then(
  order=>{
    if(!order){
      return next(new Error("No order found"))
    } 
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error("Unauthorized"))
    }
    const invoiceName = 'invoice' + orderId + '.pdf'
const invoicePath = path.join('data','invoices',invoiceName)
//fs.readFile(invoicePath,(err,data)=>{
  //if(err){
    //return next(err)
  //} 
  //res.setHeader('Content-Type','application/pdf')
  //res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"')
 // res.send(data)
 //const file = fs.createReadStream(invoicePath);
 const pdfDoc = new PDFDocument({size: "A4", margin: 50})
 res.setHeader('Content-Type','application/pdf')
  res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"')
 //file.pipe(res)
 
 pdfDoc.pipe(fs.createWriteStream(invoicePath))
 pdfDoc.pipe(res)
 pdfDoc.fillColor("#444444")
 .fontSize(20)
 .text("INVOICE",50,160);
 let totalPrice = 0; 
 console.log(Order.products)
 order.products.forEach(prod =>{
  totalPrice += prod.quantity * prod.product.price
  pdfDoc
  .fontSize(14)
  .text(
    `${prod.product.title} _ prod.quantity * $${prod.product.price}  `
  )


 })
 pdfDoc
 .fontSize(20)
 .text('Total Price = '+ totalPrice)
 pdfDoc.end()
  }
).catch(err=>{
  next(err)
})

}