// src/routes/views.router.js
const express = require('express');
const productModel = require('../dao/models/product.model');
const cartModel = require('../dao/models/cart.model');
const router = express.Router();

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productModel.find().lean();
        res.render('realTimeProducts', { products: products });
    } catch (error) {
        console.error("Error al obtener productos para la vista en tiempo real:", error);
        res.status(500).send("Error interno del servidor al cargar productos.");
    }
});

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;
    const filter = {};
    if (query) {
        if (query.includes('category')) {
            filter.category = query.split(':')[1];
        } else if (query.includes('status')) {
            filter.status = query.split(':')[1] === 'true';
        }
    }
    const sortOptions = sort ? { price: sort === 'asc' ? 1 : -1 } : {};

    try {
        const result = await productModel.paginate(filter, {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sortOptions,
            lean: true
        });

        const { docs, ...pagination } = result;
        res.render('home', { products: docs, pagination });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/products/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        const product = await productModel.findById(productId).lean();
        res.render('productDetail', { product: product });
    } catch (error) {
        res.status(500).send("Error interno del servidor al cargar el detalle del producto.");
    }
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        res.render('cartDetail', { cart });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;