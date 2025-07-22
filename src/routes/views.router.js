// src/routes/views.router.js
const express = require('express');
const ProductManager = require('../managers/ProductManager'); 
const router = express.Router();

const productManager = new ProductManager('./products.json');

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { products: products });
    } catch (error) {
        console.error("Error al obtener productos para la vista en tiempo real:", error);
        res.status(500).send("Error interno del servidor al cargar productos.");
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products: products }); 
    } catch (error) {
        console.error("Error al obtener productos para la vista home:", error);
        res.status(500).send("Error interno del servidor al cargar la página de inicio.");
    }
});

router.get('/products/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        const product = await productManager.getProductById(productId);
        
        res.render('productDetail', { product: product }); 
    } catch (error) {
        console.error(`Error al obtener producto con ID ${productId}:`, error);
        
        res.status(500).send("Error interno del servidor al cargar el detalle del producto.");
    }
});

module.exports = router;