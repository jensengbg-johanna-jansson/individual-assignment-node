//setup database
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('database.json');
const database = lowdb(adapter);

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

const getAllProducts = async () => {
    return await database.get('products');
}

const addProductToCart = async (productKey, quantity) => {
    return await database.get('cart')
                .push({ productKey: productKey,
                        quantity: quantity })
                .write();
}

const removeProductFromCart = async (productKey) => {
    return await database.get('cart')
                        .remove({ productKey: productKey })
                        .write();
}

const deleteCart = async () => {
    const productKeyArray = await database.get('cart')
                                        .map('productKey')
                                        .value();

    for(i = 0; i < productKeyArray.length; i++){
        await database.get('cart')
                    .remove({ productKey: productKeyArray[i] })
                    .write();
    }    
}

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
    console.log(message);
    return message;
}


module.exports.initiateDatabase = initiateDatabase;
module.exports.getAllProducts = getAllProducts;
module.exports.addProductToCart = addProductToCart;
module.exports.removeProductFromCart = removeProductFromCart;
module.exports.deleteCart = deleteCart;
module.exports.getProducts = getProducts;
module.exports.productChecker = productChecker;