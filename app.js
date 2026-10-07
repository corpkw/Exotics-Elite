// =====================================
// VERSIÓN DE PRODUCTOS (Para limpiar caché automáticamente)
// =====================================
const VERSION_PRODUCTOS = "v2"; 
if(localStorage.getItem("version_app") !== VERSION_PRODUCTOS){
    localStorage.removeItem("productos"); // Borra los productos viejos automáticamente solo si cambió la versión
    localStorage.setItem("version_app", VERSION_PRODUCTOS);
}
// =====================================
// CONFIGURACIÓN
// =====================================

const CLAVE_ADMIN = "Elite_934727549_2026";
let categoriaActual = "todos";
let slideActual = 0;

// =====================================
// CARRITO
// =====================================

let carritoItems = JSON.parse(localStorage.getItem("carrito")) || [];

// =====================================
// PRODUCTOS
// =====================================

let productos = JSON.parse(localStorage.getItem("productos")) || [
    {
        nombre: "Corse",
        precio: 80,
        categoria: "ropa",
        imagen: "Imagenes/Corse.png",
        imagenes: [
            "Imagenes/Corse.png",
            
        ],
        descripcion: "Corse elegante ideal para eventos especiales y celebraciones",
        colores: ["Rojo", "Negro"],
        stock: 5
    },

];

// =====================================
// CATEGORÍAS
// =====================================

function nombreCategoria(cat){
    switch(cat){
        case "ropa": return "Ropa";
        case "cuidado_personal": return "Cuidado Personal";
        case "accesorio": return "👜 Accesorios";
        case "belleza": return "💄 Belleza";
        case "mascotas": return "🐾 Mascotas";
        default: return "📦 Producto";
    }
}

// =====================================
// MOSTRAR PRODUCTOS
// =====================================

function mostrarProductos(){
    const contenedor = document.getElementById("productos");
    if(!contenedor) return;

    const buscador = document.getElementById("buscar");
    const texto = buscador ? buscador.value.toLowerCase().trim() : "";

    contenedor.innerHTML = "";

    const filtrados = productos.filter(producto => {
        const coincideCategoria = categoriaActual === "todos" || producto.categoria === categoriaActual;
        const coincideBusqueda = producto.nombre.toLowerCase().includes(texto);
        return coincideCategoria && coincideBusqueda;
    });

    if(filtrados.length === 0){
        contenedor.innerHTML = `<div class="sin-productos">😔 No encontramos productos.</div>`;
        return;
    }

    filtrados.forEach(producto => {
        const index = productos.indexOf(producto);
        contenedor.innerHTML += `
            <div class="card" onclick="verProducto(${index})">
                <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/300x300?text=Sin+imagen'">
                <div class="info">
                    <div class="badge">${nombreCategoria(producto.categoria)}</div>
                    <h3>${producto.nombre}</h3>
                    <div class="precio">S/${Number(producto.precio).toFixed(2)}</div>
                    <button class="btn-ver-producto" onclick="event.stopPropagation(); verProducto(${index})">Ver producto</button>
                </div>
            </div>
        `;
    });
}

// =====================================
// FILTRAR CATEGORÍA
// =====================================

function filtrarCategoria(cat, elemento){
    categoriaActual = cat;
    document.querySelectorAll(".categoria-card").forEach(card => card.classList.remove("active"));
    if(elemento) elemento.classList.add("active");
    mostrarProductos();
}

// =====================================
// VER PRODUCTO Y GALERÍA DE MODELOS
// =====================================

function verProducto(index){
    const producto = productos[index];
    if(!producto) return;

    const modal = document.getElementById("modalProducto");
    if(!modal) return;

    const modalImg = document.getElementById("modalImg");
    const modalGaleria = document.getElementById("modalGaleria");
    const modalNombre = document.getElementById("modalNombre");
    const modalDescripcion = document.getElementById("modalDescripcion");
    const modalPrecio = document.getElementById("modalPrecio");
    const modalColores = document.getElementById("modalColores");
    const modalStock = document.getElementById("modalStock");
    const btnComprar = document.getElementById("btnComprarModal");

    const listaImgs = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : [producto.imagen];
    
    if(modalImg) modalImg.src = listaImgs[0];

    if(modalGaleria){
        modalGaleria.innerHTML = listaImgs.map((img, i) => `
            <img src="${img}" alt="Modelo ${i+1}" onclick="cambiarImagenModal('${img}')" class="miniatura-galeria">
        `).join("");
    }

    if(modalNombre) modalNombre.textContent = producto.nombre;
    if(modalDescripcion) modalDescripcion.textContent = producto.descripcion || "Producto de excelente calidad.";
    if(modalPrecio) modalPrecio.textContent = `S/${Number(producto.precio).toFixed(2)}`;
    
    if(modalStock){
        modalStock.textContent = `Stock disponible: ${producto.stock !== undefined ? producto.stock : 0} unidades`;
    }

    if(modalColores){
        const colores = producto.colores || [];
        modalColores.innerHTML = colores.map(color => `<span class="color-badge">🎨 ${color}</span>`).join("");
    }

    if(btnComprar){
        btnComprar.onclick = function(){
            agregarAlCarrito(index);
            cerrarModal();
        };
    }

    modal.style.display = "flex";
}

function cambiarImagenModal(url){
    const modalImg = document.getElementById("modalImg");
    if(modalImg) modalImg.src = url;
}

function cerrarModal(){
    const modal = document.getElementById("modalProducto");
    if(modal) modal.style.display = "none";
}

// =====================================
// CARRITO PERMANENTE AL COSTADO
// =====================================

function guardarCarrito(){
    localStorage.setItem("carrito", JSON.stringify(carritoItems));
}

function agregarAlCarrito(index){
    const producto = productos[index];
    if(!producto) return;

    const existe = carritoItems.find(item => item.nombre === producto.nombre);

    if(existe){
        existe.cantidad++;
    }else{
        carritoItems.push({
            nombre: producto.nombre,
            precio: Number(producto.precio),
            cantidad: 1
        });
    }

    guardarCarrito();
    renderCarrito();
}

function aumentarCantidad(index){
    if(!carritoItems[index]) return;
    carritoItems[index].cantidad++;
    guardarCarrito();
    renderCarrito();
}

function disminuirCantidad(index){
    if(!carritoItems[index]) return;
    if(carritoItems[index].cantidad > 1){
        carritoItems[index].cantidad--;
    }else{
        carritoItems.splice(index, 1);
    }
    guardarCarrito();
    renderCarrito();
}

function renderCarrito(){
    const lista = document.getElementById("listaCarrito");
    const totalHTML = document.getElementById("totalCarrito");
    const contador = document.getElementById("contador");

    if(!lista) return;

    lista.innerHTML = "";
    let total = 0;
    let cantidadTotal = 0;

    if(carritoItems.length === 0){
        lista.innerHTML = `<p style="text-align:center; color:#888; margin-top:20px; font-size:13px;">Tu carrito está vacío.</p>`;
    }

    carritoItems.forEach((item, index) => {
        const subtotal = Number(item.precio) * Number(item.cantidad);
        total += subtotal;
        cantidadTotal += Number(item.cantidad);

        lista.innerHTML += `
            <div class="item-carrito">
                <div>
                    <strong>${item.nombre}</strong>
                    <p>S/${Number(item.precio).toFixed(2)}</p>
                </div>
                <div class="controles-carrito">
                    <button class="btn-cantidad" onclick="disminuirCantidad(${index})">➖</button>
                    <span class="cantidad">${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="aumentarCantidad(${index})">➕</button>
                </div>
                <div><strong>S/${subtotal.toFixed(2)}</strong></div>
            </div>
        `;
    });

    if(contador) contador.textContent = cantidadTotal;
    if(totalHTML) totalHTML.innerHTML = `<strong>Total: S/${total.toFixed(2)}</strong>`;
}

// =====================================
// WHATSAPP
// =====================================

function enviarPedidoWhatsapp(){
    if(carritoItems.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let mensaje = "Hola Exotics Elite 👋\n\n";
    let total = 0;

    carritoItems.forEach(item => {
        const subtotal = Number(item.precio) * Number(item.cantidad);
        total += subtotal;
        mensaje += `${item.nombre} x${item.cantidad} - S/${subtotal.toFixed(2)}\n`;
    });

    mensaje += `\nTOTAL: S/${total.toFixed(2)}`;

    window.open(`https://wa.me/51934727549?text=${encodeURIComponent(mensaje)}`, "_blank");
}

// =====================================
// ADMINISTRADOR
// =====================================

function mostrarAdmin(){
    const login = document.getElementById("loginAdmin");
    if(login) login.style.display = "block";
}

function validarAdmin(){
    const input = document.getElementById("claveAdmin");
    if(!input) return;

    if(input.value === CLAVE_ADMIN){
        document.getElementById("loginAdmin").style.display = "none";
        document.getElementById("panelAdmin").style.display = "block";
        renderizarAdminProductos();
        input.value = "";
    }else{
        alert("Contraseña incorrecta");
    }
}

function agregarProducto(){
    const nombre = document.getElementById("nombre").value.trim();
    const precio = document.getElementById("precio").value;
    const stock = document.getElementById("stock").value;
    const imagenPrincipal = document.getElementById("imagen").value.trim();
    const imagenesExtras = document.getElementById("imagenesExtras").value.trim();
    const coloresTexto = document.getElementById("coloresAdmin").value.trim();
    const categoria = document.getElementById("categoria").value;

    if(!nombre || !precio || !imagenPrincipal){
        alert("Complete al menos el nombre, precio y la imagen principal.");
        return;
    }

    let listaImagenes = [imagenPrincipal];
    if(imagenesExtras){
        const extras = imagenesExtras.split(",").map(img => img.trim()).filter(img => img !== "");
        listaImagenes = listaImagenes.concat(extras);
    }

    let listaColores = ["Disponible"];
    if(coloresTexto){
        listaColores = coloresTexto.split(",").map(c => c.trim()).filter(c => c !== "");
    }

    const nuevoProducto = {
        nombre: nombre,
        precio: Number(precio),
        stock: Number(stock) || 0,
        imagen: imagenPrincipal,
        imagenes: listaImagenes,
        categoria: categoria,
        descripcion: "Producto agregado por administrador.",
        colores: listaColores
    };

    productos.push(nuevoProducto);
    localStorage.setItem("productos", JSON.stringify(productos));
    mostrarProductos();
    renderizarAdminProductos();

    // Limpiar campos
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById("imagenesExtras").value = "";
    document.getElementById("coloresAdmin").value = "";
    alert("Producto agregado correctamente");
}

function eliminarProducto(index){
    if(confirm("¿Estás seguro de que deseas eliminar este producto?")){
        productos.splice(index, 1);
        localStorage.setItem("productos", JSON.stringify(productos));
        mostrarProductos();
        renderizarAdminProductos();
    }
}

function renderizarAdminProductos(){
    const contenedor = document.getElementById("listaAdminProductos");
    if(!contenedor) return;

    contenedor.innerHTML = "";
    productos.forEach((prod, index) => {
        contenedor.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee; font-size:13px;">
                <span><strong>${prod.nombre}</strong> (Stock: ${prod.stock || 0})</span>
                <button onclick="eliminarProducto(${index})" style="background:#ff4d72; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-weight:bold;">🗑️ Eliminar</button>
            </div>
        `;
    });
}

// =====================================
// CARRUSEL
// =====================================

function iniciarCarrusel(){
    const slides = document.querySelectorAll(".slide");
    if(slides.length === 0) return;

    setInterval(() => {
        slides[slideActual].classList.remove("active");
        slideActual++;
        if(slideActual >= slides.length) slideActual = 0;
        slides[slideActual].classList.add("active");
    }, 8000);
}

// =====================================
// INICIO
// =====================================

document.addEventListener("DOMContentLoaded", function(){
    mostrarProductos();
    renderCarrito();
    iniciarCarrusel();

    const buscador = document.getElementById("buscar");
    if(buscador){
        buscador.addEventListener("input", mostrarProductos);
    }
});
