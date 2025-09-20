// Simple Product API Demo

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function () {
    // Get reference to the API URL input
    const apiUrlInput = document.getElementById('api-url');

    // Button to load all products
    document.getElementById('load-products').addEventListener('click', loadProducts);

    // Form to add a new product
    document.getElementById('add-form').addEventListener('submit', function (e) {
        e.preventDefault();
        addProduct();
    });

    // Button to get a product by ID
    document.getElementById('get-product').addEventListener('click', getProductById);

    // Button to find a product for updating
    document.getElementById('find-product').addEventListener('click', findProductForUpdate);

    // Form to update a product
    document.getElementById('update-form').addEventListener('submit', function (e) {
        e.preventDefault();
        updateProduct();
    });

    // Button to delete a product
    document.getElementById('delete-product').addEventListener('click', deleteProduct);

    // Load products when page loads
    loadProducts();

    // Function to get the current API base URL
    function getApiUrl() {
        return apiUrlInput.value.trim();
    }

    // Function to show a message
    function showMessage(text, isError = false) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = isError ? 'error' : 'success';

        // Clear the message after 5 seconds
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = '';
        }, 5000);
    }

    // Function to load all products
    function loadProducts() {
        const productsTable = document.getElementById('products-list');
        productsTable.innerHTML = '<tr><td colspan="5">Loading products...</td></tr>';

        fetch(`${getApiUrl()}/products`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(products => {
                if (products.length === 0) {
                    productsTable.innerHTML = '<tr><td colspan="5">No products found</td></tr>';
                    return;
                }

                let html = '';
                products.forEach(product => {
                    html += `
                        <tr>
                            <td>${product.id}</td>
                            <td>${product.name}</td>
                            <td>${product.description}</td>
                            <td>$${product.price.toFixed(2)}</td>
                            <td>${product.quantity}</td>
                        </tr>
                    `;
                });
                productsTable.innerHTML = html;
            })
            .catch(error => {
                productsTable.innerHTML = '<tr><td colspan="5">Error loading products</td></tr>';
                showMessage('Failed to load products: ' + error.message, true);
            });
    }

    // Function to add a new product
    function addProduct() {
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const price = parseFloat(document.getElementById('price').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        const product = {
            name: name,
            description: description,
            price: price,
            quantity: quantity
        };

        fetch(`${getApiUrl()}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                showMessage('Product added successfully');
                document.getElementById('add-form').reset();
                loadProducts();
            })
            .catch(error => {
                showMessage('Failed to add product: ' + error.message, true);
            });
    }

    // Function to get a product by ID
    function getProductById() {
        const id = document.getElementById('get-id').value;
        if (!id) {
            showMessage('Please enter a product ID', true);
            return;
        }

        fetch(`${getApiUrl()}/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                const resultDiv = document.getElementById('get-result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                    <p><strong>ID:</strong> ${product.id}</p>
                    <p><strong>Name:</strong> ${product.name}</p>
                    <p><strong>Description:</strong> ${product.description}</p>
                    <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                    <p><strong>Quantity:</strong> ${product.quantity}</p>
                    <p><strong>Created Date:</strong> ${new Date(product.createdDate).toLocaleString()}</p>
                `;
            })
            .catch(error => {
                showMessage('Failed to get product: ' + error.message, true);
                document.getElementById('get-result').style.display = 'none';
            });
    }

    // Function to find a product for updating
    function findProductForUpdate() {
        const id = document.getElementById('update-id').value;
        if (!id) {
            showMessage('Please enter a product ID', true);
            return;
        }

        fetch(`${getApiUrl()}/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                document.getElementById('update-name').value = product.name;
                document.getElementById('update-description').value = product.description;
                document.getElementById('update-price').value = product.price;
                document.getElementById('update-quantity').value = product.quantity;
                document.getElementById('update-form').style.display = 'block';
            })
            .catch(error => {
                showMessage('Failed to find product: ' + error.message, true);
                document.getElementById('update-form').style.display = 'none';
            });
    }

    // Function to update a product
    function updateProduct() {
        const id = document.getElementById('update-id').value;
        const name = document.getElementById('update-name').value;
        const description = document.getElementById('update-description').value;
        const price = parseFloat(document.getElementById('update-price').value);
        const quantity = parseInt(document.getElementById('update-quantity').value);

        const product = {
            id: id,
            name: name,
            description: description,
            price: price,
            quantity: quantity
        };

        fetch(`${getApiUrl()}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                showMessage('Product updated successfully');
                document.getElementById('update-form').style.display = 'none';
                document.getElementById('update-id').value = '';
                loadProducts();
            })
            .catch(error => {
                showMessage('Failed to update product: ' + error.message, true);
            });
    }

    // Function to delete a product
    function deleteProduct() {
        const id = document.getElementById('delete-id').value;
        if (!id) {
            showMessage('Please enter a product ID', true);
            return;
        }

        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        fetch(`${getApiUrl()}/products/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                showMessage('Product deleted successfully');
                document.getElementById('delete-id').value = '';
                loadProducts();
            })
            .catch(error => {
                showMessage('Failed to delete product: ' + error.message, true);
            });
    }
});