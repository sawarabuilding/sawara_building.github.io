# MEMOの編集

`assets/js/archive-data.js` の `ARCHIVE_ITEMS` にある対象作品へ `memo: '正式な本文'` を設定します。各作品で独立した文章を指定できます。HTMLやCSSの変更は不要です。

`memo` が未設定の新規作品には `DEFAULT_ARCHIVE_MEMO` の共通仮文章を自動表示します。明示的に `memo: ''` とするとMEMOを非表示にできます。長田は既存の `memo: NAGATA_MEMO` と187字の本文を維持しています。文章の文字数制限や省略はありません。

表示は共通の `archive-detail.js` と既存の `.archive-memo` CSSを使用します。基本情報の下、ダウンロードがある作品ではDOWNLOADと補足文字の下に表示します。写真やダウンロードの処理は変更していません。

ローカルサーバー起動後、`node scripts/check-archive-memo-all.cjs` で全10作品をPC・スマートフォン幅で確認できます。現時点でPhotographの実作品は登録されていないため、テスト内の一時データで共通処理への適用を確認します。実作品やカテゴリメニューは追加していません。
