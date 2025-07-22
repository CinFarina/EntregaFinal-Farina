const { Router } = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const cartManager = new CartManager('./carts.json');
const productManager = new ProductManager('./products.json');


router.use(async (req, res, next) => {
    try {
        await cartManager.loadCarts();
        await productManager.loadProducts(); 
        next();
    } catch (error) {
        res.status(500).send({ status: "error", message: "Error al cargar los carritos/productos." });
    }
});

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});


router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        res.json({ status: "success", payload: cart.products }); 
    } catch (error) {
        res.status(404).send({ status: "error", message: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        try {
            await productManager.getProductById(pid);
        } catch (productError) {
            return res.status(404).send({ status: "error", message: `El producto con ID '${pid}' no existe.` });
        }

        const updatedCart = await cartManager.addProductToCart(cid, pid);
        res.json({ status: "success", payload: updatedCart });
    } catch (error) {
        res.status(404).send({ status: "error", message: error.message });
    }
});

module.exports = router;