// src/scripts/routes/url-parser.js
const UrlParser = {
  parseActiveUrlWithCombiner() {
    const activeUrl = window.location.hash.slice(1).toLowerCase();
    const splittedUrl = this._urlSplitter(activeUrl);
    return this._urlCombiner(splittedUrl);
  },

  parseActiveUrlWithoutCombiner() {
    const activeUrl = window.location.hash.slice(1).toLowerCase();
    return this._urlSplitter(activeUrl);
  },

  _urlSplitter(url) {
    const urlsSplits = url.split('/');
    return {
      resource: urlsSplits[0] || null, // e.g., 'story'
      id: urlsSplits[1] || null,       // e.g., 'story-id-123'
      verb: urlsSplits[2] || null,
    };
  },

  _urlCombiner(splittedUrl) {
    // Menggabungkan kembali menjadi format yang bisa dicocokkan di routes.js
    // Jika ada ID, kita akan membuat format seperti '#resource/:id'
    // Jika tidak, hanya '#resource'
    let combined = `#${splittedUrl.resource || ''}`;
    if (splittedUrl.id) {
      // Untuk pencocokan di routes.js, kita bisa menggunakan placeholder generik
      // atau menangani rute dinamis secara berbeda di app.js
      // Untuk saat ini, kita akan membuat rute spesifik untuk detail
      // Jika resource adalah 'story' dan ada id, maka ini adalah rute detail
      if (splittedUrl.resource === 'story' && splittedUrl.id) {
        return '#story/:id'; // Ini akan menjadi kunci di objek routes
      }
    }
    // Jika tidak ada ID atau bukan rute detail story, kembalikan resource saja
    // atau rute default jika resource kosong
    return combined === '#' ? '#login' : combined; // Default ke #login jika hash hanya '#' atau kosong
  },
};

export default UrlParser;