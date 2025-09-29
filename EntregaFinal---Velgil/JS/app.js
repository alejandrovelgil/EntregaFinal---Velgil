let products = [];
const form = document.getElementById("productForm");
const resetButton = document.getElementById("resetButton");
const productsContainer = document.getElementById("productsContainer");
const summary = document.getElementById("summary");
const searchInput = document.getElementById("searchInput");

let editingProductId = null;

async function loadProducts() {
  const stored = localStorage.getItem("products");
  if (stored) {
    products = JSON.parse(stored);
  } else {
    try {
      const res = await fetch("./DATA/data.json");
      products = await res.json();
      saveProducts();
    } catch (error) {
      console.error("No se pudo cargar DATA/data.json:", error);
      products = [];
    }
  }
  renderProducts();
}

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function renderProducts(filter = "") {
  productsContainer.innerHTML = "";

  let filtered = products.filter((p) =>
    `${p.id} ${p.name} ${p.scent}`.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    productsContainer.innerHTML = "<p class='empty'>No hay productos</p>";
    summary.textContent = "";
    return;
  }

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>ID:</strong> ${p.id}</p>
      <p><strong>Aroma:</strong> ${p.scent}</p>
      <p><strong>Unidades:</strong> ${p.units}</p>
      <p><strong>Precio:</strong> $${p.price.toFixed(2)}</p>
      <div class="card-actions">
        <button onclick="editProduct('${p.id}')">✏️ Editar</button>
        <button onclick="deleteProduct('${p.id}')">🗑️ Eliminar</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });

  const totalUnits = filtered.reduce((sum, p) => sum + p.units, 0);
  
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newProduct = {
    id: form.productID.value.trim(),
    name: form.productName.value.trim(),
    scent: form.productScent.value.trim(),
    units: parseInt(form.productUnits.value),
    price: parseFloat(form.productPrice.value),
  };

  if (!newProduct.id || !newProduct.name) {
    Swal.fire("Error", "Completa todos los campos", "error");
    return;
  }

  if (editingProductId) {
    const index = products.findIndex((p) => p.id === editingProductId);
    if (index !== -1) {
      products[index] = newProduct;
      Swal.fire("Actualizado", "Producto editado con éxito", "success");
    }
    editingProductId = null;
    form.querySelector("#submitBtn").textContent = "Agregar Producto";
  } else {
    if (products.some((p) => p.id === newProduct.id)) {
      Swal.fire("Error", "Ya existe un producto con ese ID", "error");
      return;
    }
    products.push(newProduct);
    Swal.fire("Agregado", "Producto agregado con éxito", "success");
  }

  saveProducts();
  renderProducts();
  form.reset();
});

resetButton.addEventListener("click", () => {
  form.reset();
  editingProductId = null;
  form.querySelector("#submitButton").textContent = "Agregar Producto";
});

window.editProduct = function (id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  form.productID.value = product.id;
  form.productName.value = product.name;
  form.productScent.value = product.scent;
  form.productUnits.value = product.units;
  form.productPrice.value = product.price;

  editingProductId = id;
  form.querySelector("#submitButton").textContent = "Guardar Cambios";
};

window.deleteProduct = function (id) {
  Swal.fire({
    title: "¿Eliminar producto?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      products = products.filter((p) => p.id !== id);
      saveProducts();
      renderProducts();
      Swal.fire("Eliminado", "Producto eliminado con éxito", "success");
    }
  });
};

searchInput.addEventListener("input", (e) => {
  renderProducts(e.target.value);
});

loadProducts();