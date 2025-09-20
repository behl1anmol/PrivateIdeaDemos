using MinimalWebApiDemo.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader()
               .WithExposedHeaders("Content-Disposition");
    });
});

// Configure Kestrel with HTTP/2 fallback to HTTP/1.1
//builder.WebHost.ConfigureKestrel(options =>
//{
//    options.AddServerHeader = false;
//    options.ConfigureHttpsDefaults(https =>
//    {
//        https.SslProtocols = System.Security.Authentication.SslProtocols.Tls12 |
//                            System.Security.Authentication.SslProtocols.Tls13;
//    });
//});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// In-memory database - This will act as our temporary database
var products = new List<Product>();
var nextId = 1;

// Seed data - Add some initial products when the application starts
products.AddRange(new List<Product>
{
    new Product { Id = nextId++, Name = "Laptop", Description = "High-performance gaming laptop", Price = 1299.99m, Quantity = 10 },
    new Product { Id = nextId++, Name = "Smartphone", Description = "Latest flagship smartphone", Price = 899.99m, Quantity = 25 },
    new Product { Id = nextId++, Name = "Wireless Headphones", Description = "Noise-cancelling wireless headphones", Price = 199.99m, Quantity = 50 },
    new Product { Id = nextId++, Name = "Gaming Mouse", Description = "RGB gaming mouse with DPI settings", Price = 79.99m, Quantity = 100 },
    new Product { Id = nextId++, Name = "Mechanical Keyboard", Description = "RGB mechanical keyboard with blue switches", Price = 149.99m, Quantity = 75 }
});

// CRUD Operations - API Endpoints

// 1. CREATE - Add a new product
app.MapPost("/api/products", (Product product) =>
{
    if (string.IsNullOrWhiteSpace(product.Name) || string.IsNullOrWhiteSpace(product.Description))
    {
        return Results.BadRequest("Name and Description are required");
    }

    if (product.Price <= 0)
    {
        return Results.BadRequest("Price must be greater than 0");
    }

    product.Id = nextId++;
    product.CreatedDate = DateTime.UtcNow;
    products.Add(product);

    return Results.Created($"/api/products/{product.Id}", product);
})
.WithName("CreateProduct")
.WithTags("Products");

// 2. READ ALL - Get all products
app.MapGet("/api/products", () =>
{
    return Results.Ok(products.OrderBy(p => p.Id));
})
.WithName("GetAllProducts")
.WithTags("Products");

// 3. READ BY ID - Get a specific product by ID
app.MapGet("/api/products/{id:int}", (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    return product != null ? Results.Ok(product) : Results.NotFound($"Product with ID {id} not found");
})
.WithName("GetProductById")
.WithTags("Products");

// 4. UPDATE - Update an existing product
app.MapPut("/api/products/{id:int}", (int id, Product updatedProduct) =>
{
    var existingProduct = products.FirstOrDefault(p => p.Id == id);

    if (existingProduct == null)
    {
        return Results.NotFound($"Product with ID {id} not found");
    }

    if (string.IsNullOrWhiteSpace(updatedProduct.Name) || string.IsNullOrWhiteSpace(updatedProduct.Description))
    {
        return Results.BadRequest("Name and Description are required");
    }

    if (updatedProduct.Price <= 0)
    {
        return Results.BadRequest("Price must be greater than 0");
    }

    // Update the existing product
    existingProduct.Name = updatedProduct.Name;
    existingProduct.Description = updatedProduct.Description;
    existingProduct.Price = updatedProduct.Price;
    existingProduct.Quantity = updatedProduct.Quantity;

    return Results.Ok(existingProduct);
})
.WithName("UpdateProduct")
.WithTags("Products");

// 5. DELETE BY ID - Delete a specific product by ID
app.MapDelete("/api/products/{id:int}", (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);

    if (product == null)
    {
        return Results.NotFound($"Product with ID {id} not found");
    }

    products.Remove(product);
    return Results.Ok($"Product with ID {id} has been deleted");
})
.WithName("DeleteProductById")
.WithTags("Products");

// 6. DELETE ALL - Delete all products
app.MapDelete("/api/products", () =>
{
    var count = products.Count;
    products.Clear();
    nextId = 1; // Reset the ID counter

    return Results.Ok($"All {count} products have been deleted");
})
.WithName("DeleteAllProducts")
.WithTags("Products");

// Additional endpoint to get product count
app.MapGet("/api/products/count", () =>
{
    return Results.Ok(new { Count = products.Count });
})
.WithName("GetProductCount")
.WithTags("Products");

// Health check endpoint
app.MapGet("/api/health", () =>
{
    return Results.Ok(new
    {
        Status = "Healthy",
        Timestamp = DateTime.UtcNow,
        ProductCount = products.Count
    });
})
.WithName("HealthCheck")
.WithTags("Health");

app.Run();