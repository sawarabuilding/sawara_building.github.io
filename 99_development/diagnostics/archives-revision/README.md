# 第2次改修：トップページ整理とARCHIVES

2026-11-03。3Dモデル・実切断・カメラ操作・素材表現を維持し、情報とナビゲーションを整理しました。
GitHubへの公開・プッシュは行っていません。

## 確認画像

- `top-1366x768-exterior.png` / `top-1366x768-guide.png`
- `top-1440x900-exterior.png` / `top-1440x900-guide.png`
- `top-1920x1080-exterior.png` / `top-1920x1080-guide.png`
- `top-mobile-guide.png`
- `archives-desktop.png` / `archives-mobile.png`
- `archives-title-hover.png`

## 変更内容

### トップページ

- PCは100dvhの画面内に配置。外観・断面ともページの縦横スクロールをなくしました。
- 両モードで地上1F〜5Fの案内を表示。断面モードでは引き続き実モデルの床高さへ投影します。
- 右上の「BUILDING & ARCHIVES」「FLOOR INDEX ↘」を削除。
- 個別アーカイブ一覧をトップから削除し、黒い領域にはARCHIVESへの入口を配置。
- ARCHIVESの文字は従来の50%（PCはclamp(19px,2.7vw,43px)、モバイルは21.5px、低い画面では19px）。書体・通常時の色は維持。
- ARCHIVESは`./archives/index.html`へのリンク。44px以上のタップ領域、マウス・Enter・タッチに対応。
- 3D領域のスワイプ後に合成クリックが省略されるケースを再現し、静止した単独タップをリンクへ渡す共通処理を追加。ドラッグ・キーボード・マウスは従来の動作を維持。
- 外観ではホイールズーム・右ドラッグ、案内では階移動を維持。地下階の状態は内部に残し、トップに個別資料の一覧は生成しません。
- 以前のscroll-snap表示は`floors.html`に保持し、左側の小さな「スクロール式の階案内」からアクセスできます。

### ガラス

Three.jsで元のガラス材質だけをAlpha=0.20に変更しました。単色確認表示も同じ20%です。
透明ブレンド・depthWrite無効・単一パスを維持し、木とコンクリートは変更していません。
GLBを再生成・上書きしていません。`model-hashes.json`の改修前SHA-256と全既存GLBが一致しています。

### ARCHIVES独立ページ

`archives/index.html`を新設しました。
参考: [Darren Oorloff](https://darrenoorloff.com/)。黒と白のタイポグラフィ、変化のある余白を中心に構成しています。

- 左上のSAWARA BUILDING ARCHIVESはPC・モバイルとも一行。通常は透明な内部と白いアウトライン。
- ホバー・キーボードフォーカス時は白く塗り、180msで控えめに発光。動きを減らす設定ではアニメーションを省略。
- ヘッダーはスクロール中も上部に残り、左タイトルでページ先頭へ戻れます。
- 右上は3Dトップ`../index.html`への独立したリンク。
- 正式ロゴ画像はリポジトリにないため、右上は暫定のSAWARA BUILDING文字表示です。正式ロゴは制作していません。
- PC3列、タブレット2列、スマートフォン1列。カテゴリーで列を分けず、各資料のサイズ・余白・書体に変化をつけました。
- 指定の9タイトルをそのまま仮配置。独立した整理番号、架空の説明・画像・詳細ページは追加していません。
- カテゴリーは小さな補助表記としてFREE PAPER、EVENT、ARCHITECTURE、MONEYを使用。
- 全9項目のimage・urlは未登録（null）。存在しないページへのダミーリンクはありません。

## 更新方法

`assets/js/archive-data.js`のARCHIVE_ITEMSでtitle・image・imageAlt・url・category・layoutを変更します。
imageとurlは、実際のファイル・ページができたときだけ登録してください。URLはarchives/index.htmlから見た相対パスです。
ARCHIVE_BRAND.logoUrlへ正式ロゴの相対パスを登録すると文字表示を画像へ差し替えます。

共通ヘッダーは`assets/js/archive-header.js`のmountArchiveHeader。
将来の詳細ページでは、同じヘッダー要素とともにarchiveHref・buildingHref・logoUrlを渡し、isArchiveHome=falseで一覧へ戻すリンクにできます。
独立ページの画像・資料名の描画は`assets/js/archives.js`、スタイルは`assets/css/archives.css`です。

## 動作検証

`npm.cmd run dev`でローカル配信し、別のターミナルから`npm.cmd run check:browser`を実行。
インストール済みChromeのヘッドレスブラウザを使用しています。

| PCサイズ | 外観のページ高さ | 案内のページ高さ | 模型・階表示・入口 |
| --- | ---: | ---: | --- |
| 1366×768 | 768px | 768px | 画面内 |
| 1440×900 | 900px | 900px | 画面内 |
| 1920×1080 | 1080px | 1080px | 画面内 |

モデルの投影範囲、UIの座標、スクロール寸法を測定し、スクリーンショットでも確認しました。
回転・ズーム・右ドラッグ・断面切り替え・階移動・20%のガラス・リンクとキーボード・発光・各列数・タッチ操作・全GLBハッシュ一致を検証。
結果は`browser-validation.json`に保存しています。通常表示のJavaScriptエラー・HTTPエラーは0件です。
スマートフォンは390×844px・タッチ入力のエミュレーション、タブレットは820px幅で検証しました。

## 変更ファイル

既存ファイル:

- `index.html`
- `assets/css/style.css`
- `assets/js/building.js`
- `assets/js/directory.js`
- `assets/js/floor-navigation.js`
- `assets/js/floors.js`
- `assets/js/scene-layout.js`
- `package.json`
- ルートおよびdiagnosticsのREADME

新規ファイル:

- `archives/index.html`
- `assets/css/archives.css`
- `assets/js/archive-data.js`
- `assets/js/archive-header.js`
- `assets/js/archives.js`
- `assets/js/tap-link.js`
- `scripts/check-archives-browser.cjs`
- このフォルダーのレポート・検証JSON・確認PNG

変更前のコードは`.local-backups/before-archives-revision.zip`へ保存しました。

## 未解決・未登録

- 正式ロゴ画像、資料画像、各資料の詳細URLは未登録。ユーザーの提示素材が揃ってから設定します。
- スマートフォン実機・Safariでの検証は未実施です。
- 既存の切断輪郭26エッジの未閉塞、166部材の未照合など、前回の3Dモデル側の制限はそのままです。今回の改修で形状の修復・材質分類の推測は行っていません。
- 旧`archives.html`は既存URL互換用に保持しています。現在のトップからの入口は`archives/index.html`です。
