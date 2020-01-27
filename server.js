//setup sever
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const db = require('./databaseFunctions');

app.use(express.static('public'));

//get all products
app.get('/api/products', async (request, response) => {
    const res = await db.getAllProducts();
    response.send(res);
});

//add product to cart
app.post('/api/cart', async (request, response) => {
    const productKey = request.query.productKey;
    const quantity = request.query.quantity;
    const checkProduct = await db.productChecker(productKey);  // check if products exist or is already in cart
    
    let message = {
        success: false,
        message: '',
        foundProduct: checkProduct
    }

    if(checkProduct.productInCart == false) {
        const addToCart = await db.addProductToCart(productKey, quantity);
        if(addToCart) {
            message.success = true;
            message.message = 'Product was added to cart'
        } else {
            message.message = 'The product could not be added to cart'
        }
    } else {
        if(checkProduct.productInCart == true) {
            message.message = 'Product already in cart'
        } else {
            message.message = 'Could not find product'
        }
        
    }

    response.send(message);
});

//remove product from cart
app.delete('/api/cart', async (request, response) => {
    console.log(request.url);
    const productKey = request.query.productKey;
    const checkProduct = await db.productChecker(productKey);  // check if products exist or is in cart
    let message = {
        success: false,
        message: '',
        foundProduct: checkProduct
    }

    if(checkProduct.productInCart == true) {
        const removeFromCart = await db.removeProductFromCart(productKey);
        if(removeFromCart != '') {
            message.success = true;
            message.message = 'Product was removed from cart'
        } else {
            message.message = 'The product could not be removed from cart'
        }
    } else {
        if(checkProduct.productInCart == false) {
            message.message = 'No such product in cart'
        } else {
            message.message = 'Could not find product'
        }       
    }

    response.send(message);
});

//get cart
app.get('/api/cart', async (request, response) => {
    const res = await db.getProducts();
    response.send(res);
});

app.delete('/api/delcart', async (request, response) => {
    const res = await db.deleteCart();
    response.send(res);
});

//start server
app.listen(port, () => {
    console.log('Starting new server at port: ', port);
    db.initiateDatabase();
});