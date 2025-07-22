const express = require('express');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');
const productRouter = require('./routes/products.router.js');
const cartRouter = require('./routes/carts.router.js');
const viewsRouter = require('./routes/views.router.js');

const ProductManager = require('./managers/ProductManager'); 
const productManager = new ProductManager('./products.json');

const app = express();
const PORT = 8080;

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views'); 
app.set('view engine', 'handlebars'); 

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

app.use('/', viewsRouter);

app.use((req, res) => {
    res.status(404).send({ status: "error", message: "Ruta no encontrada." });
});


const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log('¡Listo para recibir peticiones en Postman!');
});

const io = new Server(httpServer); 

io.on('connection', async socket => { 
    console.log('Nuevo cliente conectado!');

    try {
        const products = await productManager.getProducts();
        socket.emit('productsUpdated', products); 
    } catch (error) {
        console.error("Error al emitir productos iniciales:", error);
    }

    socket.on('addProduct', async productData => {
        console.log('Producto recibido del cliente para agregar:', productData);
        try {
            await productManager.addProduct(productData);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts); 
        } catch (error) {
            console.error("Error al agregar producto:", error.message);
            
            socket.emit('error', { message: error.message, type: 'addProductError' });
        }
    });

    socket.on('deleteProduct', async productId => {
        console.log('ID de producto recibido del cliente para eliminar:', productId);
        try {
            await productManager.deleteProduct(productId);
            const updatedProducts = await productManager.getProducts();
            io.emit('productsUpdated', updatedProducts); 
        } catch (error) {
            console.error("Error al eliminar producto:", error.message);
            socket.emit('error', { message: error.message, type: 'deleteProductError' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});