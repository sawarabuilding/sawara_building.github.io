# フォルダー構成と更新方法

## 番号

01_about / 02_cafe / 03_archives がページ、90_shared が共通素材、99_development が作業用です。各階層で番号を付け、公開後はURL保全のため番号を変更しません。表示順はデータで指定します。

## アーカイブ

全10件。03_archives/data.js が掲載順・分類の一覧、各資料の data.js がタイトル・日付・文章・クレジット・画像・PDF・layout を保持します。素材は同じ資料フォルダーの images/ と pdf/ に置きます。未登録素材・本文は元の準備中表示を維持しています。

- sawaraban-1: 03_archives/01_freepaper/01_sawaraban-01/
- sawaraban-2: 03_archives/01_freepaper/02_sawaraban-02/
- sawaraban-3: 03_archives/01_freepaper/03_sawaraban-03/
- building-1: 03_archives/02_architecture/01_building-01/
- building-2: 03_archives/02_architecture/02_building-02/
- building-3: 03_archives/02_architecture/03_building-03/
- zine-fes-2026: 03_archives/03_exhibition/01_zine-nagata-2026/
- seishin-2026: 03_archives/03_exhibition/02_zine-seishin-2026/
- money-2026: 03_archives/04_money/01_report-2026/
- magazine-1: 03_archives/05_magazine/01_magazine-01/

各カテゴリーの index.html は共通の一覧処理で該当分類を表示します。詳細の index.html には data-archive-detail に固定IDを指定します。共通処理は 90_shared/js/archive-detail.js、一覧は archives.js です。

新規資料は、同じカテゴリーのフォルダーを複製し、番号・ID・data.js・index.htmlを編集して、03_archives/data.js に import と掲載順を追加します。番号だけの変更は避けてください。画像とPDFは data.js の import.meta.url を基準に解決するため、一覧・詳細のどちらからも同じ素材を参照できます。

## ABOUT・CAFE

01_about/index.html に紹介文、data.js に連絡先・画像・ナビ、style.css と script.js に専用の表示処理があります。02_cafe も index.html / data.js / style.css / script.js / images/ の構成です。

## TOPと共通素材

階名・リンクは 90_shared/js/floors.js、模型設定は model-config.js。外観・断面モデルは 90_shared/models/。代替画像は 90_shared/images/building-fallback.png に置き、公開画面は diagnostics に依存しません。

## 旧URL

旧HTMLは転送専用で残します。archives/work.html?id=… も新しい個別ページへ転送します。/03_archives/?category=paper など従来のカテゴリー指定も利用できます。

## 開発用

99_development/tools にローカルサーバー・検証・変換スクリプト、diagnostics に過去の確認記録があります。古い検証記録は履歴資料です。今回の構成の検証は npm.cmd run check:structure を使用します。開発用フォルダーはローカルサーバーでは配信しません。GitHub Pages側で非公開扱いにする機能ではないため、秘密情報は置かないでください。

転送以外のページは index.html に統一しています。package.json 等のツール設定ファイルと .git 等は標準名のままです。
