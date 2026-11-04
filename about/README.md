# ABOUT / CONTACT の編集

- 本文: `about/index.html` の `#about-copy` 内の段落。
- 連絡先: `assets/js/about-data.js` の `ABOUT_CONTACT`。空欄は「未設定」として表示され、リンクは付きません。email にメールアドレス、instagram に https:// から始まるURLを入力します。
- 画像: 同ファイルの `ABOUT_IMAGES`。実在するWebPの src、代替文 alt、幅の割合 size、上余白 offset を指定します。公開済み詳細ページがある場合のみ href を指定し、それ以外は省略します。
- ナビ: `ABOUT_NAV`。MAGAZINE は公開後に追加してください。
- TOP・今後の断面画面のABOUTリンクは `/about/` に統一します。タッチ操作には既存の `enableTapNavigation` を適用できます。

ビルド不要。`about/index.html` により GitHub Pages で `/about/` を直接開けます。
