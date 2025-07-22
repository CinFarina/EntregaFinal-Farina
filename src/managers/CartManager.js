const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class CartManager {
    constructor(path) {
        this.path = path;
        this.carts = [];
        this.loadCarts();
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf8');
            this.carts = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT' || error.name === 'SyntaxError') {
                this.carts = [];
            } else {
                console.error("Error al cargar carritos:", error);
                throw error;
            }
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf8');
        } catch (error) {
            console.error("Error al guardar carritos:", error);
            throw error;
        }
    }

    async createCart() {
        await this.loadCarts();
        const newCart = {
            id: uuidv4(),
            products: []
        };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart; 
    }

    async getCartById(id) {
        await this.loadCarts();
        const cart = this.carts.find(c => c.id === id);
        if (!cart) {
            throw new Error(`Carrito con ID '${id}' no encontrado.`);
        }
        return cart;
    }

    async addProductToCart(cartId, productId) {
        await this.loadCarts();
        const cartIndex = this.carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) {
            throw new Error(`Carrito con ID '${cartId}' no encontrado.`);
        }

        const cart = this.carts[cartIndex];
        const productInCartIndex = cart.products.findIndex(p => p.product === productId);

        if (productInCartIndex !== -1) {
            cart.products[productInCartIndex].quantity++;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await this.saveCarts();
        return cart;
    }
}

module.exports = CartManager;