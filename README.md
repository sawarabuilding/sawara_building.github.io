# SAWARA BUILDING / 鰆ビルヂング

番号付きフォルダーと index.html で管理する静的サイトです。

- TOP: index.html
- 01_about/: 紹介・連絡先
- 02_cafe/: カフェ
- 03_archives/: 全資料一覧。01_freepaper / 02_architecture / 03_exhibition / 04_money / 05_magazine に分類
- 90_shared/: CSS・JavaScript・ロゴ・3Dモデル・外部ライブラリー
- 99_development/: tools（開発・検証）/ diagnostics（確認結果）/ docs（構成・更新方法）

## 確認

`npm.cmd run dev` → http://127.0.0.1:4173/

`npm.cmd run check:structure` → ページ・データ・リンク・旧URL転送を検証。

[構成と更新方法](99_development/docs/structure.md)

旧 about/・cafe/・archives/ と archives.html・floors.html は転送専用です。公開ページの編集には使用しません。JavaScriptで旧URLのクエリー・ハッシュも引き継ぎます。新しいページはすべて index.html です。

公開・コミット・プッシュは、この整理作業には含めていません。
