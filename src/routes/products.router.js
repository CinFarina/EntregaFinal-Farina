const express = require('express');
const productModel = require('../dao/models/product.model');
const router = express.Router();

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;
    
    const filter = {};
    if (query) {
        if (query.includes('category')) {
            const category = query.split(':')[1];
            filter.category = category;
        } 
        else if (query.includes('status')) {
            const status = query.split(':')[1] === 'true';
            filter.status = status;
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

        const response = {
            status: 'success',
            payload: docs,
            totalPages: pagination.totalPages,
            prevPage: pagination.prevPage,
            nextPage: pagination.nextPage,
            page: pagination.page,
            hasPrevPage: pagination.hasPrevPage,
            hasNextPage: pagination.hasNextPage,
            prevLink: pagination.hasPrevPage ? `http://localhost:8080/api/products?page=${pagination.prevPage}&limit=${pagination.limit}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: pagination.hasNextPage ? `http://localhost:8080/api/products?page=${pagination.nextPage}&limit=${pagination.limit}&sort=${sort || ''}&query=${query || ''}` : null,
        };
        
        res.json(response);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ status: 'error', payload: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await productModel.create(req.body);
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear producto' });
    }
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productModel.findById(pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al buscar producto' });
    }
});

router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(pid, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al actualizar producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const deletedProduct = await productModel.findByIdAndDelete(pid);
        if (!deletedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: deletedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al eliminar producto' });
    }
});

module.exports = router;