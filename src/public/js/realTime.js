const socket = io(); 

console.log('Cliente Socket.IO conectado');

const addProductForm = document.getElementById('addProductForm');
const deleteProductForm = document.getElementById('deleteProductForm');
const realTimeProductsList = document.getElementById('realTimeProductsList');

if (addProductForm) { 
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const product = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            code: document.getElementById('code').value,
            price: parseFloat(document.getElementById('price').value), 
            stock: parseInt(document.getElementById('stock').value),   
            category: document.getElementById('category').value,
            
            thumbnails: document.getElementById('thumbnails').value.split(',').map(item => item.trim()).filter(item => item.length > 0)
        };

        socket.emit('addProduct', product);

        addProductForm.reset(); 
    });
} else {
    console.error("Formulario 'addProductForm' no encontrado en el DOM.");
}


if (deleteProductForm) { 
    deleteProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const productId = document.getElementById('deleteId').value;

        
        socket.emit('deleteProduct', productId);

        deleteProductForm.reset(); 
    });
} else {
    console.error("Formulario 'deleteProductForm' no encontrado en el DOM.");
}


if (realTimeProductsList) { 
    socket.on('productsUpdated', (products) => {
        console.log('Lista de productos actualizada recibida:', products);
        realTimeProductsList.innerHTML = ''; 

        if (products.length === 0) {
            const noProductsItem = document.createElement('li');
            noProductsItem.textContent = 'No hay productos disponibles.';
            realTimeProductsList.appendChild(noProductsItem);
        } else {
            products.forEach(product => {
                const listItem = document.createElement('li');
                
                listItem.innerHTML = `
                    <strong>${product.title}</strong> (${product.category}) - $${product.price} <br>
                    Descripción: ${product.description} <br>
                    Código: ${product.code} - Stock: ${product.stock} <br>
                    ID: ${product.id}
                `;
                realTimeProductsList.appendChild(listItem);
            });
        }
    });
} else {
    console.error("Elemento 'realTimeProductsList' no encontrado en el DOM.");
}

socket.on('error', (errorData) => {
    console.error("Error del servidor:", errorData.message);
    alert(`Error: ${errorData.message}`); 
});