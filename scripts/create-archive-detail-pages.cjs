// Generate independent HTML shells. Existing pages are protected from overwriting.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
(async()=>{
 const {ARCHIVE_ITEMS}=await import(pathToFileURL(path.join(root,'assets/js/archive-data.js')));
 for(const item of ARCHIVE_ITEMS){
  const file=path.join(root,'archives',`${item.id}.html`);if(fs.existsSync(file))continue;
  fs.writeFileSync(file,`<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(item.title)} | SAWARA BUILDING ARCHIVES</title>
  <link rel="icon" href="data:,">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/archives.css">
  <script type="module" src="../assets/js/archive-detail.js"></script>
</head>
<body id="top" class="archive-detail-page">
  <header id="archive-header" class="archive-header">
    <a class="archive-home-title" href="./index.html">SAWARA BUILDING ARCHIVES</a>
    <a class="archive-building-logo" href="../index.html" aria-label="鰆ビルヂングの3Dトップページへ"><img src="../assets/images/sawara-building-logo.png" alt="SAWARA BUILDING"></a>
  </header>
  <main class="archive-detail" data-archive-detail="${item.id}">
    <h1>${escape(item.title)}</h1>
    <section class="detail-media" aria-label="画像・資料">
      <div class="media-placeholder">画像・資料は準備中です。</div>
    </section>
    <section class="detail-description" aria-labelledby="description-heading">
      <h2 id="description-heading">ABOUT</h2>
      <p class="detail-empty">説明文は準備中です。</p>
    </section>
    <section class="detail-downloads" aria-labelledby="downloads-heading">
      <h2 id="downloads-heading">PDF</h2>
      <p class="detail-empty">PDFは未登録です。</p>
    </section>
  </main>
  <footer class="archive-footer"><a href="./index.html">ARCHIVES一覧へ</a><a href="#top">ページの先頭へ ↑</a></footer>
</body>
</html>
`);
 }
})();
