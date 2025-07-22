const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const productManager = new ProductManager('./products.json');


router.use(async (req, res, next) => {
    try {
        await productManager.loadProducts();
        next();
    } catch (error) {
        res.status(500).send({ status: "error", message: "Error al cargar los productos." });
    }
});


router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json({ status: "success", payload: products });
    } catch (error) {
        res.status(500).send({ status: "error", message: error.message });
    }
});


router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        res.json({ status: "success", payload: product });
    } catch (error) {
        res.status(404).send({ status: "error", message: error.message });
    }
});


router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json({ status: "success", payload: newProduct });
    } catch (error) {
        res.status(400).send({ status: "error", message: error.message });
    }
});


router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        res.json({ status: "success", payload: updatedProduct });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            res.status(404).send({ status: "error", message: error.message });
        } else {
            res.status(400).send({ status: "error", message: error.message });
        }
    }
});


router.delete('/:pid', async (req, res) => {
    try {
        const message = await productManager.deleteProduct(req.params.pid);
        res.json({ status: "success", message: message });
    } catch (error) {
        res.status(404).send({ status: "error", message: error.message });
    }
});

module.exports = router;