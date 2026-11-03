# キッチン フラミンゴ：カフェページ初期試作

白背景・黒罫線の中央メニュー表と指定写真への変更は [白背景・写真差し替えの記録](../diagnostics/cafe-white-photo/README.md) を参照してください。
現在の初期表は上部「KITCHEN FLAMINGO」「MENU」の2段、下部はabout／reserve・contact／instagramの2列×2段です。
4項目の文言は `TABLE_ITEMS` で管理し、未制作のリンク先は設定していません。
最新の寸法変更（写真140％、最上段75％）は [レイアウト修正③](../diagnostics/cafe-layout3/README.md) を参照してください。
既存のAbout／Contactのパネル操作、MENUからメニューを開く操作、屋号から初期表示へ戻る操作は維持しています。

プレビュー： http://127.0.0.1:4173/cafe/
起動はリポジトリのルートで `npm.cmd run dev`。ビルド・追加ライブラリは不要です。

## 操作

- 初期画面：屋号とナビは中央固定。背景はゆっくり動き、ページのスクロールに合わせて配置が変わります。
- ABOUT／MENU／CONTACT：PCは左ナビ・右本文、700px以下は上ナビ・下本文。リロードせず切り替えます。
- 屋号：初期画面へ。Escでも閉じられます。
- 右上の既存正式ロゴ：いつでも3Dトップへ戻ります。
- 既存断面の1F「CAFE」から入れます。スマートフォンは従来どおり日本語階名「カフェ」がリンクです。

## 文章・メニュー・素材の更新

`cafe-data.js` の `SECTIONS` にナビ項目と内容をまとめています。
ABOUTの `paragraphs`／`image`、MENUの `items`（`name`・`description`・`price`・`image`）、CONTACTの `fields`（`label`・`text`・`url`）を編集します。
連絡先URLがnullならリンクは生成しません。具体的な住所・営業時間・アカウント・料理名・価格は未設定です。

背景は `BACKGROUND_ITEMS` で個別管理します。

| 設定 | 内容 |
| --- | --- |
| image | 画像の相対URL。nullなら空の写真枠 |
| x／y | 画面内の基準位置（％） |
| width／angle | 幅（px）・傾き（度） |
| mobile | スマートフォンでの位置・サイズ |
| drift／speed | ゆっくりした移動量・速度 |
| scroll／parallax | スクロールとマウスによる移動量 |

`cafe.css` 冒頭の `--drift-speed`、`--scroll-amount`、`--pointer-amount`、`--motion-duration`、`--content-duration`、`--title-size` で全体を調整できます。
色は `--paper`／`--ink`。調整後は再読み込みで反映します。
OSの動きを減らす設定では背景移動・遷移アニメーションを停止します。
表示中のパネルは独立してスクロール可能です。画像エラー時にもナビ・本文の操作は継続できます。

## 素材と制限

背景にはユーザー指定の `000016.jpg` を使用。旧4点のオリジナルSVGは保全していますが、背景での使用を終了しました。
出典・ライセンスは [assets/README.md](assets/README.md)。写真は [assets/images/](assets/images/) に追加できます。
参考サイト https://lawrencemtl.com/ はブラウザでアクセス保護が表示されるため、公開されている英語版の文言とSiteinspire掲載画像を参照しました。固有の画像・ロゴは流用していません。

完成版ブランチ `backup/top-page-v1-20261103` のコミットは維持。
作業ブランチは `feature/1f-kitchen-flamingo`。プッシュ・公開は行っていません。
既存の186件の未追跡ファイルには変更を加えていません。

現在の検証：ローカルサーバー起動後 `node scripts/check-cafe-layout3.cjs`。
現在の画面と検証記録は [diagnostics/cafe-layout3](../diagnostics/cafe-layout3/README.md)。
旧デザインの記録は [diagnostics/cafe-prototype](../diagnostics/cafe-prototype/README.md) に保全しています。
