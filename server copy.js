//setup modules, database and express
const express = require('express');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('database.json');
const database = lowdb(adapter);
const app = express();
const port = process.env.PORT || 8000;

app.use(express.static('public'));

//create new database
const initiateDatabase = () => {
    const productDatabaseInitiated = database.has('products').value();
    const cartDatabaseInitiated = database.has('cart').value();

    if(!productDatabaseInitiated) {
        database.defaults({ products: [] }).write();
    }
    if(!cartDatabaseInitiated) {
        database.defaults({ cart: [] }).write();
    }
}

//get all products
app.get('/api/products', async (request, response) => {
    const res = await database.get('products');
    response.send(res);
});

//add product to cart
app.post('/api/cart', async (request, response) => {
    const productKey = request.query.productKey;
    const checkProduct = await productChecker(productKey);  // check if products exist or is already in cart
    
    let message = {
        success: false,
        message: '',
        foundProduct: checkProduct
    }

    if(checkProduct.productInCart == false) {
        const addToCart = await database.get('cart')
                                        .push({ productKey: productKey })
                                        .write();
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
    const checkProduct = await productChecker(productKey);
    let message = {
        success: false,
        message: '',
        foundProduct: checkProduct
    }

    if(checkProduct.productInCart == true) {
        const removeFromCart = await database.get('cart')
                                            .remove({ productKey: productKey })
                                            .write();
        if(removeFromCart != '') {
            message.success = true;
            message.message = 'Product was removed from cart'
        } else {
            message.message = 'The product could not be removed cart'
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
    const res = await getProducts();
    response.send(res);
});


//checking if the specified product exist in the database and if it has been added to the cart
const productChecker = async (productKey) => {
    const productExist = await database.get('products')
                                        .find({ productKey: productKey })
                                        .value();
    let message = {
        productExist: null,
        productInCart: null
    };

    if(productExist !== undefined) {
        message.productExist = true;

        const productInCart = await database.get('cart')
                                            .find({ productKey: productKey })
                                            .value();

        if(productInCart !== undefined) {
            message.productInCart = true;
        } else {
            message.productInCart = false;
        }

    } else {
        message.productExist = false;
    }
    console.log(message);
    return message;
}

//gets the product objects from the products database, based on which products are in the cart
const getProducts = async () => {
    const productKeyArray = await database.get('cart')
                                        .map('productKey')
                                        .value();
    let message = {
        success: true,
        emptyCart: '',
        products: ''
    };

    if(productKeyArray != '') {
        let productList = [];

        for(i = 0; i < productKeyArray.length; i++){
            let product = await database.get('products')
                        .find({ productKey: productKeyArray[i] })
                        .value();
            productList.push(product);
        }

        message.emptyCart = false;
        message.products = productList;
    } else if(productKeyArray == '') {
        message.emptyCart = true;
    } else {
        message.success = false;
    }

    return message;
}


//start server
app.listen(port, () => {
    console.log('Starting new server at port: ', port);
    initiateDatabase();
})