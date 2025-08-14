const express = require('express');
const cartModel = require('../dao/models/cart.model');
const productModel = require('../dao/models/product.model');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartModel.create({ products: [] });
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear carrito' });
    }
});

// POST /api/carts/:cid/products/:pid - Agrega un producto a un carrito
router.post('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        
        const product = await productModel.findById(pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        
        const productInCart = cart.products.find(item => item.product.toString() === pid);
        if (productInCart) {
            productInCart.quantity++;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }
        
        await cart.save();
        
        res.status(201).json({ status: 'success', message: 'Producto agregado al carrito', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
});

// GET
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al buscar carrito' });
    }
});

// DELETE
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        
        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();
        
        res.json({ status: 'success', message: 'Producto eliminado del carrito', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito' });
    }
});

// PUT 
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body; 
    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        
        const productInCart = cart.products.find(item => item.product.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }
        
        productInCart.quantity = quantity;
        await cart.save();
        
        res.json({ status: 'success', message: 'Cantidad de producto actualizada', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al actualizar cantidad del producto' });
    }
});

// DELETE 
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        
        cart.products = [];
        await cart.save();
        
        res.json({ status: 'success', message: 'Todos los productos del carrito han sido eliminados', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al vaciar carrito' });
    }
});

module.exports = router;