const express = require('express');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const productRouter = require('./routes/products.router');
const cartRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const productModel = require('./dao/models/product.model');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');


mongoose.connect('mongodb://localhost:27017/tu_base_de_datos', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexión exitosa a la base de datos');
}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
});


app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);


app.use((req, res, next) => {
    res.status(404).send('Ruta no encontrada');
});

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

const io = new Server(httpServer);

io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!');

    try {
        const products = await productModel.find().lean();
        socket.emit('productsUpdated', products);
    } catch (error) {
        console.error("Error al emitir productos iniciales:", error);
    }

    socket.on('addProduct', async productData => {
        try {
            const newProduct = await productModel.create(productData);
            const updatedProducts = await productModel.find().lean();
            io.emit('productsUpdated', updatedProducts);
        } catch (error) {
            console.error("Error al agregar producto:", error.message);
            socket.emit('error', { message: error.message, type: 'addProductError' });
        }
    });

    socket.on('deleteProduct', async productId => {
        try {
            await productModel.findByIdAndDelete(productId);
            const updatedProducts = await productModel.find().lean();
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