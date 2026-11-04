# 第3次改修：外観・CONTENTS・ARCHIVES

ローカル実装。GitHubへの公開・pushは行っていません。元のRhino・OBJ・MTL・GLBは変更していません。
着手前のコードを `.local-backups/before-revision3.zip`、旧階案内を `.local-backups/floors-before-revision3.html` に保存しました。

## 画面

- [PC 外観](1366-exterior.png)
- [PC 断面案内](1366-guide.png)
- [スマートフォン 断面案内](390-guide.png)
- [ARCHIVES一覧・正式ロゴ](1366-archives.png)
- [個別ページ](1366-detail.png)
- [スマートフォン 個別ページ](390-detail.png)

## 変更内容

外観では階案内を非表示にし、CONTENTSから従来の約1.8秒のカメラ遷移で案内へ入ります。従来の模型クリックでの入場も維持しました。
回転停止・復帰ボタン、スクロール式案内へのリンク、モード説明を撤去。案内モード左上は建物名と日本語名のみ、左下の操作UIはありません。
案内中のホイール・矢印・スワイプによる階移動は廃止。模型に沿った床高さのラベルから直接選択します。
模型へのraycastがなく、実際の地表の投影位置より上をクリック・タップした場合に外観へ戻り、自動回転を再開します。
リンクはcanvas外の独立した要素で、復帰操作と競合しません。キーボードではTabで「空」にフォーカスしてEnter／Spaceでも復帰できます。

ARCHIVESは黒い地面左側に配置し、文字列全体を-90度回転。前回の文字サイズを維持しています。
ガラスのみThree.js側で色を `#AFC5D2`、不透明度を0.20に設定。木・コンクリート・断面形状は変更していません。
旧 `floors.html` はトップへの互換リダイレクトになり、スクロール式案内は稼働しません。旧JS/CSSは保全しています。

## 正式ロゴ

指定フォルダーにはAI、JPEG、PNGの複数候補がありました。透過用と明記された `260614_ロゴ_背景透明.png` を採用し、
`assets/images/sawara-building-logo.png` にコピーしました。元の黒い透過ロゴにCSSの `filter:invert(1)` を適用して白く表示します。
元画像・コピー画像の画素は変更していません。ロゴはARCHIVES一覧と全個別ページの右上からトップへリンクします。

## 変更ファイル

- `index.html`、`floors.html`
- `assets/css/style.css`、`assets/css/archives.css`
- `assets/js/building.js`、`floor-navigation.js`、`directory.js`、`scene-layout.js`
- `assets/js/archive-data.js`、`archive-detail.js`（新設）
- `assets/images/sawara-building-logo.png`（新設）
- `archives/index.html`
- `archives/sawaraban-1.html`、`sawaraban-2.html`、`sawaraban-3.html`（新設）
- `archives/zine-fes-2026.html`、`seishin-2026.html`（新設）
- `archives/building-1.html`、`building-2.html`、`building-3.html`（新設）
- `archives/money-2026.html`（新設）
- `scripts/create-archive-detail-pages.cjs`、`scripts/check-revision3-browser.cjs`、`scripts/check-revision3-touch.cjs`（新設）
- `package.json`、`README.md`、`diagnostics/README.md`、本フォルダーの検証記録・画面

個別HTMLは共通CSS・共通ヘッダー処理を使用します。タイトル・URL・画像は `archive-data.js` で管理。
同データに `description`、`pdf` を追加すると本文とダウンロードリンクが表示されます。未登録時は準備中表示のみです。

## 検証

ローカルChromeのヘッドレスブラウザで、1366×768、1440×900、1920×1080、390×844、375×667を確認。
PC3サイズは外観・断面とも縦横のページオーバーフローなし。5階の表示、ARCHIVESの地面内配置、ガラスの色・不透明度を確認しました。
外観の自動回転・ホイールズーム・右ドラッグ、CONTENTS、模型／地面クリックで復帰しないこと、空クリックと回転再開が正常です。
9件の独立ページへ実際に遷移し、一覧に戻れること、正式ロゴからトップへ戻れることを確認。ローカルHTTPエラー・JS例外なし。
タッチエミュレーションでは入場、階ボタン、空タップ、ARCHIVES、個別ページ往復を確認。スワイプで階が変わらないことも確認しました。
OSの動きを減らす設定では自動回転停止・遷移省略を維持。キーボードの空操作、タイトルの発光と先頭復帰も確認しました。
全5GLBのSHA-256は前回記録と一致しています。

詳細な自動検証結果は [results.json](results.json)、タッチ・アクセシビリティは [touch-accessibility.json](touch-accessibility.json)。
再検証はローカルサーバー起動後に `npm.cmd run check:browser` と `npm.cmd run check:touch`。

## 残る事項

- 地上テナントの個別ページは未作成でURL未登録です。階ボタンは選択・強調のみで、架空のページへのリンクは追加していません。
- 9資料の画像・本文・PDFは未提供のため未登録です。
- スマートフォンはChromeの端末・タッチエミュレーションで検証。iOS Safari／実機での最終確認は未実施です。
- 元モデルに由来する断面の既知の制限は前回の[B1断面レポート](../b1-revision/README.md)を参照。今回形状は変更していません。
