# MAGAZINE #1

指定フォルダー直下のmain.jpgを固定表紙、残りのJPEG／PNG 20点を詳細候補として取り込みました。PSDとサブフォルダー内の制作素材は対象外です。元画像は変更せず、作業用コピーからWebP（quality 90、長辺最大2200px、縦横比維持）を生成しています。対応表・元画像SHA-256・サイズはconversion.jsonに記録しています。

保存先は `assets/archives/magazine-1/`。表紙は `magazine-1-cover.webp`、候補は `magazine-1-01.webp`〜`magazine-1-20.webp` です。

## 今後の追加

`assets/js/archive-data.js` のMAGAZINE項目にある `randomImages.count` が詳細表示枚数（現在5）です。候補を追加する場合はWebPを保存し、`randomImages.candidates` を更新します。mainの表紙は候補に入れません。

#2以降は `ARCHIVE_ITEMS` にcategoryが `magazine` の項目を追加し、固有ID・タイトル・表紙・候補画像を設定します。詳細URLは `./work.html?id=magazine-2` のように指定します。work.htmlはARCHIVES共通の詳細画面で、MAGAZINE専用ページではありません。日付・紹介文・PDFは追加していません。

抽選はFREE PAPERとは独立した `archive-random-images.js` で、候補のコピーをFisher–Yates方式でシャッフルして先頭5枚を採用します。開いている間は再抽選せず、再度開くと再抽選します。同じ組み合わせや順番が偶然再現することはあります。候補が5枚未満の場合は全候補を使用します。

## 確認方法

`npm run dev` 起動後に `node scripts/check-magazine.cjs` を実行します。PC・スマートフォン相当・横長画面でカテゴリ絞り込み、固定表紙、5枚の重複排除、画像読み込み、再オープン時の再抽選、既存作品の詳細画面を確認します。実機スマートフォンと公開後の配信は未確認です。
