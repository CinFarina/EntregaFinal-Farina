const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            this.products = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT' || error.name === 'SyntaxError') {
                this.products = [];
            } else {
                console.error("Error al cargar productos:", error);
                throw error;
            }
        }
    }

    async saveProducts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf8');
        } catch (error) {
            console.error("Error al guardar productos:", error);
            throw error;
        }
    }

    async addProduct(product) {
        const { title, description, code, price, stock, category } = product;
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Todos los campos son obligatorios (excepto thumbnails y status).');
        }

        if (this.products.some(p => p.code === code)) {
            throw new Error(`El producto con código '${code}' ya existe.`);
        }

        const newProduct = {
            id: uuidv4(),
            title,
            description,
            code,
            price,
            status: product.status !== undefined ? product.status : true,
            stock,
            category,
            thumbnails: product.thumbnails || []
        };

        this.products.push(newProduct);
        await this.saveProducts();
        return newProduct;
    }

    async getProducts() {
        await this.loadProducts();
        return this.products;
    }

    async getProductById(id) {
        await this.loadProducts();
        const product = this.products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Producto con ID '${id}' no encontrado.`);
        }
        return product;
    }

    async updateProduct(id, updatedFields) {
        await this.loadProducts();
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error(`Producto con ID '${id}' no encontrado para actualizar.`);
        }

        // Evitar actualizar el ID
        if (updatedFields.id) {
            delete updatedFields.id;
        }
        
        if (updatedFields.code && this.products.some(p => p.code === updatedFields.code && p.id !== id)) {
            throw new Error(`El código '${updatedFields.code}' ya pertenece a otro producto.`);
        }

        this.products[index] = { ...this.products[index], ...updatedFields };
        await this.saveProducts();
        return this.products[index];
    }

    async deleteProduct(id) {
        await this.loadProducts();
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== id);
        if (this.products.length === initialLength) {
            throw new Error(`Producto con ID '${id}' no encontrado para eliminar.`);
        }
        await this.saveProducts();
        return `Producto con ID '${id}' eliminado correctamente.`;
    }
}

module.exports = ProductManager;