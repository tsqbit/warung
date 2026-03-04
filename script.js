function tambahBarang() {
    let nama = document.getElementById("namaBarang").value;
    let jumlah = document.getElementById("jumlahBarang").value;
    
    if (nama == "" || jumlah == "") {
        alert("Isi dulu dong datanya!");
        return;
    }

    // Ambil tabel
    let tabel = document.getElementById("tabelStok");
    
    // Buat baris baru
    let baris = tabel.insertRow();
    let kolom1 = baris.insertCell(0);
    let kolom2 = baris.insertCell(1);
    
    // Masukkan teks ke kolom
    kolom1.innerHTML = nama;
    kolom2.innerHTML = jumlah;

    // Bersihkan input setelah klik
    document.getElementById("namaBarang").value = "";
    document.getElementById("jumlahBarang").value = "";
}// 1. FUNGSI UNTUK MEMUAT DATA SAAT WEB DIBUKA
window.onload = function() {
    tampilkanData();
};

function tambahBarang() {
    let nama = document.getElementById("namaBarang").value;
    let jumlah = document.getElementById("jumlahBarang").value;

    if (nama === "" || jumlah === "") {
        alert("Isi dulu dong datanya!");
        return;
    }

    // Ambil data lama dari laci (localStorage), kalau kosong buat list baru []
    let listBarang = JSON.parse(localStorage.getItem("stokWarung")) || [];

    // Tambahkan barang baru ke list
    listBarang.push({ nama: nama, stok: jumlah });

    // Simpan kembali list yang sudah update ke laci
    localStorage.setItem("stokWarung", JSON.stringify(listBarang));

    // Update tampilan tabel & kosongkan input
    tampilkanData();
    document.getElementById("namaBarang").value = "";
    document.getElementById("jumlahBarang").value = "";
}

function tampilkanData() {
    let tabel = document.getElementById("tabelStok");
    tabel.innerHTML = `<tr><th>Barang</th><th>Jumlah</th><th>Aksi</th></tr>`;

    let listBarang = JSON.parse(localStorage.getItem("stokWarung")) || [];

    listBarang.forEach((item, index) => {
        let baris = tabel.insertRow();
        
        // Kolom Nama
        baris.insertCell(0).innerHTML = item.nama;

        // Kolom Stok (Bisa di-klik untuk edit)
        let kolomStok = baris.insertCell(1);
        kolomStok.innerHTML = `<input type="number" value="${item.stok}" 
                               onchange="updateStok(${index}, this.value)" 
                               style="width:50px; text-align:center; border:1px solid #ddd; border-radius:3px;">`;
        
        // Efek warna kalau stok tipis
        if (parseInt(item.stok) <= 5) {
            kolomStok.firstChild.style.color = "red";
            kolomStok.firstChild.style.fontWeight = "bold";
        }

        // Tombol Hapus
        let tombolHapus = `<button onclick="hapusBarang(${index})" style="background:#e74c3c; padding:2px 8px; font-size:12px;">Hapus</button>`;
        baris.insertCell(2).innerHTML = tombolHapus;
    });
}
function hapusBarang(index) {
    let listBarang = JSON.parse(localStorage.getItem("stokWarung"));
    listBarang.splice(index, 1); // Hapus data berdasarkan urutan (index)
    localStorage.setItem("stokWarung", JSON.stringify(listBarang));
    tampilkanData();
}

function resetData() {
    if(confirm("Hapus semua data stok?")) {
        localStorage.clear();
        tampilkanData();
    }
}
// Panggil hitungKeuangan saat halaman pertama kali dibuka
window.addEventListener('load', hitungKeuangan);

function catatUang(tipe) {
    let ket = document.getElementById("ketKeuangan").value;
    let nominal = parseInt(document.getElementById("jumlahUang").value);

    if (ket === "" || isNaN(nominal)) {
        alert("Isi keterangan dan jumlah uang yang benar ya!");
        return;
    }

    // Ambil data kas lama
    let dataKas = JSON.parse(localStorage.getItem("kasWarung")) || [];

    // Simpan data baru
    dataKas.push({ keterangan: ket, jumlah: nominal, tipe: tipe });
    localStorage.setItem("kasWarung", JSON.stringify(dataKas));

    // Update angka di layar
    hitungKeuangan();
    
    // Reset input
    document.getElementById("ketKeuangan").value = "";
    document.getElementById("jumlahUang").value = "";
}

function hitungKeuangan() {
    let dataKas = JSON.parse(localStorage.getItem("kasWarung")) || [];
    let tMasuk = 0;
    let tKeluar = 0;

    dataKas.forEach(item => {
        if (item.tipe === 'masuk') {
            tMasuk += item.jumlah;
        } else {
            tKeluar += item.jumlah;
        }
    });

    // Tampilkan ke layar
    document.getElementById("totalMasuk").innerHTML = "Rp " + tMasuk.toLocaleString();
    document.getElementById("totalKeluar").innerHTML = "Rp " + tKeluar.toLocaleString();
    document.getElementById("saldo").innerHTML = "Rp " + (tMasuk - tKeluar).toLocaleString();
}

function resetKas() {
    if(confirm("Hapus semua catatan keuangan?")) {
        localStorage.removeItem("kasWarung");
        hitungKeuangan();
    }
}
function hitungKeuangan() {
    let dataKas = JSON.parse(localStorage.getItem("kasWarung")) || [];
    let tMasuk = 0;
    let tKeluar = 0;
    
    // Ambil tabel riwayat
    let tabel = document.getElementById("tabelRiwayat");
    // Reset tabel kecuali baris judul
    tabel.innerHTML = `<tr><th>Keterangan</th><th>Nominal</th><th>Tipe</th></tr>`;

    dataKas.forEach(item => {
        // 1. Hitung Total
        if (item.tipe === 'masuk') {
            tMasuk += item.jumlah;
        } else {
            tKeluar += item.jumlah;
        }

        // 2. Tambah Baris ke Tabel Riwayat
        let baris = tabel.insertRow();
        baris.insertCell(0).innerHTML = item.keterangan;
        baris.insertCell(1).innerHTML = "Rp " + item.jumlah.toLocaleString();
        
        // Kasih warna: Hijau untuk masuk, Merah untuk keluar
        let kolomTipe = baris.insertCell(2);
        kolomTipe.innerHTML = item.tipe === 'masuk' ? "▲ Masuk" : "▼ Keluar";
        kolomTipe.style.color = item.tipe === 'masuk' ? "green" : "red";
        kolomTipe.style.fontWeight = "bold";
    });

    // Update angka ringkasan di layar
    document.getElementById("totalMasuk").innerHTML = "Rp " + tMasuk.toLocaleString();
    document.getElementById("totalKeluar").innerHTML = "Rp " + tKeluar.toLocaleString();
    document.getElementById("saldo").innerHTML = "Rp " + (tMasuk - tKeluar).toLocaleString();
}
function updateStok(index, jumlahBaru) {
    let listBarang = JSON.parse(localStorage.getItem("stokWarung")) || [];
    
    // Update jumlahnya
    listBarang[index].stok = jumlahBaru;

    // Simpan lagi ke laci
    localStorage.setItem("stokWarung", JSON.stringify(listBarang));
    
    // Refresh tampilan agar warna merah (stok tipis) update otomatis
    tampilkanData();
}