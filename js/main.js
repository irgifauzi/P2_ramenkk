
// Ambil daftar menu ramen dari API
fetchMenuRamen();

// Fungsi untuk mengambil daftar menu ramen
function fetchMenuRamen() {
    fetch('https://asia-southeast2-menurestoran-443909.cloudfunctions.net/menurestoran/data/menu_ramen')
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal mengambil menu.');
            }
            return response.json();
        })
        .then(menuData => {
            // Pastikan backend mengembalikan data dalam format yang sesuai
            if (Array.isArray(menuData) && menuData.length > 0) {
                renderMenu(menuData); // Render menu items
                addCategoryFilter(menuData); // Tambahkan filter kategori
            } else {
                throw new Error('Menu tidak ditemukan.');
            }
        })
        .catch(error => {
            alert(error.message);
        });
}

// Fungsi untuk merender daftar menu
function renderMenu(data) {
    const restoContainer = document.getElementById('resto');
    restoContainer.innerHTML = ''; // Bersihkan kontainer sebelum merender menu baru

    data.forEach(menuramen => {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4'; // Kolom grid responsif

        const card = document.createElement('div');
        card.className = 'card shadow-lg rounded-xl overflow-hidden mb-4';

        // Gunakan nilai default jika field tidak tersedia
        const deskripsi = menuramen.deskripsi || 'Tidak ada deskripsi tersedia.';
        const gambar = menuramen.gambar || 'path/to/default/image.jpg';
        const harga = menuramen.harga ? `Rp ${menuramen.harga.toLocaleString('id-ID')}` : 'Harga tidak tersedia.';

        // Buat konten kartu menu
        card.innerHTML = `
            <img src="${gambar}" alt="${menuramen.nama_menu}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">${menuramen.nama_menu}</h3>
                    <p class="text-sm text-gray-600 mb-3">${deskripsi}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-blue-500">${harga}</span>
                        <button class="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg shadow-md hover:bg-blue-600 transition" 
                            onclick="addToCart({ 
                                id: '${menuramen.id}', 
                                nama_menu: '${menuramen.nama_menu}', 
                                harga_satuan: ${menuramen.harga} 
                            })">
                            Pesan
                        </button>
                    </div>
                </div>
        `;
       
        col.appendChild(card);
        restoContainer.appendChild(col);
    });
}

// Fungsi untuk menambahkan item ke keranjang
function addToCart(item) {
    console.log('Item ditambahkan ke keranjang:', item);
    // Tambahkan logika untuk menyimpan item ke keranjang jika diperlukan
}
addToCart();
// Tambahkan event listener untuk tombol filter kategori
function addCategoryFilter(menuData) {
    const categoryButtons = document.querySelectorAll('[data-category]');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            const filteredData = category === 'all' 
                ? menuData 
                : menuData.filter(item => item.kategori === category);
            renderMenu(filteredData);
        });
    });
}

// Fungsi untuk konfirmasi pesanan
document.getElementById('confirmOrder').addEventListener('click', () => {
    const customerName = document.getElementById('customerName').value.trim();
    const orderNote = document.getElementById('orderNote').value.trim();
    let seatNumber = document.getElementById('seatNumber').value.trim();

    if (!customerName) {
        alert('Nama pelanggan harus diisi.');
        return;
    }

    if (seatNumber === '' || isNaN(seatNumber)) {
        alert('Nomor meja harus diisi dengan angka.');
        return;
    }

    seatNumber = parseInt(seatNumber, 10);  // Mengonversi seatNumber ke tipe integer

    const daftarMenu = cartItems.map(item => ({
        menu_id: item.id,
        nama_menu: item.nama_menu,
        harga_satuan: item.harga,
        jumlah: item.quantity,
        subtotal: item.subtotal
    }));

    const totalHarga = calculateTotalPrice();  // Menghitung total harga seluruh pesanan

    const orderData = {
        nama_pelanggan: customerName,
        catatan_pesanan: orderNote,
        nomor_meja: seatNumber,  // Pastikan seatNumber sudah berupa integer
        daftar_menu: daftarMenu,
        total_harga: totalHarga
    };

    console.log('Data yang akan dikirim:', orderData);  // Tambahkan log untuk memeriksa data sebelum dikirim

    // Panggil fungsi untuk mengirim data ke server
    postPemesanan(orderData);
});

// Fungsi untuk mengirim data pesanan ke server
async function postPemesanan(data) {
    try {
        const response = await fetch('https://asia-southeast2-menurestoran-443909.cloudfunctions.net/menurestoran/tambah/pesanan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Pesanan berhasil dikirim:', result);

        // Tampilkan pesan sukses
        Swal.fire({
            icon: 'success',
            title: 'Update succesful',
            text: 'Updating user succesful...',
            timer: 2000,
            showConfirmButton: false,
          });
        // Reset keranjang dan form setelah sukses
        cartItems = [];
        updateCartDisplay();
    } catch (error) {
        console.error('Error saat mengirim pesanan:', error);
        Swal.fire({
                   icon: 'error',
                   title: 'error add data',
                   text: 'error add data pesanan. ' +error,
                   timer: 2000,
                   showConfirmButton: false,
    });
    }
}



