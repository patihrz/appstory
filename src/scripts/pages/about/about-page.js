// src/scripts/pages/about/about-page.js

const AboutPage = {
  async render() {
    return `
      <div class="container about-container py-5">
        <header class="text-center mb-5">
          <h1 class="display-4">Tentang Dicoding Story App</h1>
          <p class="lead text-muted">Platform berbagi cerita dan momen spesial seputar Dicoding.</p>
        </header>

        <div class="row">
          <div class="col-md-8 mx-auto">
            <section class="mb-4">
              <h2 class="h4 mb-3">Misi Kami</h2>
              <p>Dicoding Story App dirancang sebagai wadah bagi para siswa, alumni, dan siapa saja yang terlibat dalam ekosistem Dicoding untuk berbagi pengalaman, pencapaian, atau momen inspiratif mereka. Kami percaya setiap cerita memiliki nilai dan dapat memotivasi orang lain.</p>
            </section>

            <section class="mb-4">
              <h2 class="h4 mb-3">Fitur Utama</h2>
              <ul>
                <li>Bagikan cerita Anda dengan deskripsi dan foto.</li>
                <li>Lihat cerita-cerita dari pengguna lain.</li>
                <li>Sertakan lokasi pada cerita Anda (opsional).</li>
                <li>Antarmuka yang bersih dan mudah digunakan.</li>
                <li>Desain responsif untuk berbagai perangkat.</li>
              </ul>
            </section>
            
            <section class="mb-4">
              <h2 class="h4 mb-3">Teknologi yang Digunakan</h2>
              <p>Aplikasi ini dibangun menggunakan teknologi web modern, termasuk:</p>
              <ul>
                <li>Vanilla JavaScript (ES6+) untuk logika aplikasi.</li>
                <li>HTML5 dan CSS3 untuk struktur dan tampilan.</li>
                <li>Dicoding Story API sebagai backend dan sumber data.</li>
                <li>Leaflet.js untuk fitur pemetaan.</li>
                <li>Vite sebagai build tool modern.</li>
              </ul>
            </section>

            <section>
              <h2 class="h4 mb-3">Kontak</h2>
              <p>Jika Anda memiliki pertanyaan, masukan, atau ingin berkontribusi, jangan ragu untuk menghubungi kami melalui platform Dicoding.</p>
              <p class="text-center mt-4">
                <a href="#home" class="btn btn-primary">Kembali ke Home</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // Fungsi ini bisa kosong jika tidak ada interaksi DOM spesifik
    // yang perlu ditambahkan setelah halaman dirender.
    // Misalnya, jika ada tombol atau elemen interaktif lain yang perlu event listener.
    console.log('AboutPage afterRender: Halaman "Tentang" telah dirender.');
    // Anda bisa menambahkan fungsionalitas lain di sini jika diperlukan.
  },
};

export default AboutPage;
