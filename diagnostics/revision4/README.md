# 第4次改修：外観モードのみ

## 変更ファイル

- `index.html`：画質・素材UIを削除、CONTENTSの矢印を削除、既存正式ロゴと2行メッセージを追加。Noto Sans JPの700を読み込み。
- `assets/css/style.css`：外観のみARCHIVESを非表示、CONTENTSの下線を撤去して700に、ロゴとメッセージを配置。断面では追加要素を非表示。
- `assets/js/building.js`：削除したUIの参照・イベントを撤去。素材表示に固定し、形状確認用マテリアル生成コードは保持。画質は従来の標準設定（上限1.5、モバイル上限1）を維持。
- `scripts/check-revision4-browser.cjs`：今回の外観UIと既存操作・リンクの回帰検証。
- 本フォルダー：検証記録・スクリーンショット。

着手前の対象ファイル・保全対象ハッシュは `.local-backups/revision4/` に保存しています。
ARCHIVES一覧・9件の個別HTML・共通ARCHIVES CSS・カメラ設定・全GLBは変更していません。公開・pushなし。

## 画面

- [PC外観](1366-exterior.png)
- [スマートフォン外観](390-exterior.png)
- [断面モード](1366-guide.png)

## 確認項目

ChromeヘッドレスでPC 1366×768、1440×900、1920×1080、モバイル390×844、375×667を確認。
画質・素材UIなし、外観でARCHIVES非表示、CONTENTSの装飾なし・700、正式ロゴと2行メッセージを確認。
ロゴとメッセージのクリックでモードが変わらず、外観自動回転・右ドラッグ・ズーム・CONTENTS入場・空クリック復帰が動作することを確認。
断面では従来のARCHIVES位置・-90度回転・リンクと地上階表示が維持され、追加ロゴ・メッセージは非表示。
ARCHIVES9ページへの遷移と一覧復帰、ARCHIVESページのロゴからトップへ戻るリンクも回帰確認しています。
PCは縦横スクロールなし。JavaScript例外・ローカルHTTPエラーなし。結果は [results.json](results.json)。
高密度画面の標準設定は [standard-quality.json](standard-quality.json)、資料とモデルの保全確認は [preserved-files.json](preserved-files.json)。

ロゴは既存 `assets/images/sawara-building-logo.png` を再利用し、画像変更なし。黒い原画像をCSSで白く表示しています。
メッセージは游ゴシックを優先、未搭載時にNoto Sans JPへフォールバックします。
モバイルは端末エミュレーションで、スマートフォン実機は未検証です。既存の未登録資料・未制作テナントページはそのままです。

ローカルサーバー起動中に `node scripts/check-revision4-browser.cjs` で再検証できます。
