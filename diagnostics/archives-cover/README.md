# ARCHIVES 表紙追加と題字の準備

プレビュー：http://127.0.0.1:4173/archives/

## 完了した変更

- 指定PDFの1ページ目をWebP化し、SAWARABAN 1号の一覧項目に追加。
- 表紙はPC18vw、モバイルは可読性を優先して最大68vw。元の縦横比を保持し、影・枠・トリミングなし。loading=lazy。
- 既存9件の名称・URL・分類・個別書体・配置データは維持。表紙の増加分のみ後続行の位置が自然に下がります。
- ARCHIVES一覧最下部の「ページの先頭へ」リンクをHTMLから削除。専用JSはなく、個別ページも使う共通CSSは削除していません。
- 1号個別ページを含む他のページは変更なし。新しい全ページ閲覧機能は作成していません。

## 題字：フォント未提供のため未適用

プロジェクト、Windows標準／ユーザーフォント領域、Windowsのインストール済み書体を確認しましたがEurostile Extended Blackは見つかっていません。
代替書体・Archivo Blackは追加していません。**現在の題字は従来の横向き表示を維持しています。**

正規のWeb埋め込み可能なフォントを用意できたら、`assets/js/archive-data.js` の `ARCHIVE_BRAND.titleFontUrl` に相対URLを登録します。
現在はnullです。実フォントの読み込みが成功した場合だけ、一覧の題字に以下を適用するコードを準備しています。

- Eurostile Extended Blackの実ファイルをFontFace APIで読み込み。別書体への自動置換なし。
- 白1.25pxの輪郭・透明な塗り・反時計回り90度・一行・固定配置。
- 左24px、上下中央、画面高さから適正なフォントサイズを計算。字形を変形させません。
- 文字の実測幅に基づくサイズ調整、アーカイブ内容の左余白を確保。
- #topリンクと250msの白塗り・控えめな発光。動きを減らす設定に対応。

**正規フォントが未提供のため、Eurostileの字形・縦題字の最終表示・その配置とホバーは未検証／未有効化です。**

## PDF画像生成結果

| 項目 | 結果 |
| --- | --- |
| 読み込み | 成功、暗号化などによる読込エラーなし |
| ページ数 | 6ページ |
| 全ページの原稿サイズ | 216×303mm（612.283×858.898pt） |
| 元PDF容量 | 4,990,898 bytes |
| 出力 | assets/archives/sawaraban-01/cover.webp |
| 出力画像 | 998×1400px、1ページ目全体 |
| 出力容量 | 749,320 bytes（約749KB） |
| 圧縮 | WebP lossless、method=6 |
| 内容の保持 | 可逆WebPの復号画素とレンダリング画像が完全一致。色調補正・生成画像・トリミングなし |
| 元PDF | 変更なし、SHA-256一致 |

PDFiumでローカルにラスタライズし、Pillowで可逆WebP化。PDFはサイト内の公開用assetsへコピーせず、Git対象外の作業コピーだけを使用しました。
依存は `.local-cache/python` 内のpypdfium2 5.14.0／Pillow 13.0.0。Pythonは既存Blender付属のものを使用し、グローバル環境は変更していません。
生成スクリプトは既存cover.webpがある場合に上書きを拒否します。

[表紙WebP](../../assets/archives/sawaraban-01/cover.webp) ／ [変換記録](conversion.json)

## 検証

1366×768・1440×900・1920×1080・820×1180・390×844・375×667で確認。
表紙の読み込み・比率・表示幅・lazy属性、9項目のリンク、1号個別ページの従来表示、一覧への復帰、正式ロゴから3Dトップへのリンクを確認。
フォント未登録時に題字を自動置換しないこと、最下部ボタンがなく題字リンクで先頭へ戻れることも確認。
横スクロールなし、JS例外・ローカルHTTPエラーなし。
共通ARCHIVES CSS・各個別HTML・個別描画JS・3DトップのHTML／JSはハッシュ一致。

[PC一覧](1366-index.png) ／ [スマートフォン一覧](390-index.png) ／ [ブラウザ結果](browser-results.json)

## 変更・追加ファイル

- 変更：archives/index.html、assets/js/archive-data.js、assets/js/archives.js。
- 追加：assets/css/archive-index.css、assets/js/archive-title.js、assets/archives/sawaraban-01/cover.webp。
- 追加：scripts/render-sawaraban-cover.py、scripts/check-archives-cover.cjs、本フォルダー。

作業ブランチはfeature/1f-kitchen-flamingo。完成版ブランチ・元PDF・既存186件のファイルは変更なし。コミット・push・公開なし。
