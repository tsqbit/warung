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
    // Reset tabel ke judul
    tabel.innerHTML = `<tr><th>Barang</th><th>Jumlah</th><th>Aksi</th></tr>`;

    let listBarang = JSON.parse(localStorage.getItem("stokWarung")) || [];

    listBarang.forEach((item, index) => {
        let baris = tabel.insertRow();
        
        // Kolom Nama
        baris.insertCell(0).innerHTML = item.nama;

        // Kolom Stok (Ada Tombol Cepat + dan -)
        let kolomStok = baris.insertCell(1);
        kolomStok.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                <button onclick="ubahStokCepat(${index}, -1)" style="padding: 2px 8px; background: #e67e22;">-</button>
                <input type="number" value="${item.stok}" 
                       onchange="updateStok(${index}, this.value)" 
                       style="width: 40px; text-align: center; border: 1px solid #ddd;">
                <button onclick="ubahStokCepat(${index}, 1)" style="padding: 2px 8px; background: #27ae60;">+</button>
            </div>
        `;
        
        // Efek warna kalau stok tipis
        if (parseInt(item.stok) <= 5) {
            kolomStok.querySelector('input').style.color = "red";
            kolomStok.querySelector('input').style.fontWeight = "bold";
        }

        // Tombol Hapus Permanen
        let tombolHapus = `<button onclick="hapusBarang(${index})" style="background:#c0392b; padding:2px 8px; font-size:12px;">Hapus</button>`;
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

function tambahTransaksi(tipe) {
    let inputKet = document.getElementById("keterangan");
    let inputJum = document.getElementById("jumlah"); // Pastikan id di HTML-mu 'jumlah' atau 'nominal'

    let ket = inputKet.value;
    let jum = parseInt(inputJum.value);

    if (ket === "" || isNaN(jum)) {
        alert("Harap isi keterangan dan jumlah uang!");
        return;
    }

    // --- BAGIAN OTOMATIS KURANGI STOK ---
    // Jika ada uang masuk, sistem cek apakah ada nama barang di keterangan
    if (tipe === 'masuk') {
        let listBarang = JSON.parse(localStorage.getItem("stokWarung")) || [];
        let stokBerubah = false;

        listBarang.forEach((item, index) => {
            // Kalau di keterangan ada tulisan nama barang (misal: "beli beras")
            if (ket.toLowerCase().includes(item.nama.toLowerCase())) {
                let sisa = parseInt(item.stok) - 1;
                listBarang[index].stok = sisa < 0 ? 0 : sisa;
                stokBerubah = true;
            }
        });

        if (stokBerubah) {
            localStorage.setItem("stokWarung", JSON.stringify(listBarang));
            tampilkanData(); // Refresh tabel stok agar angka langsung berkurang
        }
    }

    // --- BAGIAN SIMPAN CATATAN KEUANGAN ---
    let dataKas = JSON.parse(localStorage.getItem("kasWarung")) || [];
    dataKas.push({
        keterangan: ket,
        jumlah: jum,
        tipe: tipe
    });

    localStorage.setItem("kasWarung", JSON.stringify(dataKas));
    
    // Reset input
    inputKet.value = "";
    inputJum.value = "";
    
    // Refresh tampilan keuangan
    hitungKeuangan();
}

function hitungKeuangan() {
    let dataKas = JSON.parse(localStorage.getItem("kasWarung")) || [];
    let historyKas = JSON.parse(localStorage.getItem("historyKasWarung")) || [];
    
    // --- FITUR AUTO-RESET SETIAP HARI ---
    let tanggalSekarang           = new Date().toLocaleDateString();
    let tanggalTerakhir = localStorage.getItem("tanggalSekarang");

    // Jika ini hari baru (tanggal di HP beda sama tanggal terakhir simpan)
    if (tanggalTerakhir && tanggalTerakhir !== tanggalSekarang) {
        // Pindahkan semua data kas hari ini ke dalam History
        if (dataKas.length > 0) {
            historyKas.push({
                tanggal: tanggalTerakhir,
                catatan: dataKas
            });
            localStorage.setItem("historyKasWarung", JSON.stringify(historyKas));
        }
        
        // Reset data kas hari ini jadi kosong
        dataKas = [];
        localStorage.setItem("kasWarung", JSON.stringify(dataKas));
    }
    
    // Simpan tanggal hari ini sebagai patokan besok
    localStorage.setItem("tanggalTerakhir", tanggalSekarang);
    // ------------------------------------

    let totalMasuk = 0;
    let totalKeluar = 0;

    let html = `<tr><th>Keterangan</th><th>Jumlah</th></tr>`;
    dataKas.forEach(item => {
        html += `<tr>
            <td>${item.keterangan}</td>
            <td style="color: ${item.tipe === 'masuk' ? 'green' : 'red'}">
                ${item.tipe === 'masuk' ? '+' : '-'} Rp ${item.jumlah.toLocaleString()}
            </td>
        </tr>`;

        if (item.tipe === 'masuk') totalMasuk += item.jumlah;
        else totalKeluar += item.jumlah;
    });

    document.getElementById("tabelKas").innerHTML = html;
    document.getElementById("totalSaldo").innerHTML = "Rp " + (totalMasuk - totalKeluar).toLocaleString();
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
function ubahStokCepat(index, perubahan) {
    let listBarang = JSON.parse(localStorage.getItem("stokWarung")) || [];
    
    // Ambil nilai lama dan tambahkan perubahannya (+1 atau -1)
    let stokBaru = parseInt(listBarang[index].stok) + perubahan;

    // Jaga agar stok tidak minus (paling kecil 0)
    if (stokBaru < 0) stokBaru = 0;

    // Simpan ke laci
    listBarang[index].stok = stokBaru;
    localStorage.setItem("stokWarung", JSON.stringify(listBarang));
    
    // Refresh tabel agar angka berubah di layar
    tampilkanData();
}
function lihatHistory() {
    let historyKas = JSON.parse(localStorage.getItem("historyKasWarung")) || [];
    let area = document.getElementById("areaHistory");

    if (historyKas.length === 0) {
        area.innerHTML = "<p>Belum ada sejarah catatan.</p>";
        return;
    }

    let htmlHistory = "<h3>Sejarah Kas</h3>";
    historyKas.reverse().forEach(hari => { // Pakai reverse supaya tanggal terbaru di atas
        let totalHarian = 0;
        htmlHistory += `<details style="border: 1px solid #ccc; padding: 10px; margin-bottom: 5px;">
            <summary><b>Tanggal: ${hari.tanggal}</b></summary>
            <ul>`;
        
        hari.catatan.forEach(item => {
            htmlHistory += `<li>${item.keterangan}: Rp ${item.jumlah.toLocaleString()} (${item.tipe})</li>`;
        });

        htmlHistory += `</ul></details>`;
    });

    area.innerHTML = htmlHistory;
}