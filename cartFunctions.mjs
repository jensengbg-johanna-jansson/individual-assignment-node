//checking if the specified product exist in the database and if it has been added to the cart
export const productChecker = async (productKey) => {
    const productExist = await database.get('products').find({ productKey: productKey }).value();
    let message = {
        productExist: null,
        productInCart: null
    };

    if(productExist !== undefined) {
        message.productExist = true;

        const productInCart = await database.get('cart').find({ productKey: productKey }).value();

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
export const getProducts = async () => {
    const hasProducts = await database.get('cart').map('productKey').value();
    let message = {
        success: true,
        emptyCart: '',
        products: ''
    };

    if(hasProducts != '') {
        const productKeyArray = await database.get('cart').map('productKey').value();
        let productList = [];

        for(i = 0; i < productKeyArray.length; i++){
            let product = await database.get('products')
                        .find({ productKey: productKeyArray[i] })
                        .value();
            productList.push(product);
        }

        message.emptyCart = false;
        message.products = productList;
    } else if(hasProducts == '') {
        message.emptyCart = true;
    } else {
        message.success = false;
    }

    return message;
}
