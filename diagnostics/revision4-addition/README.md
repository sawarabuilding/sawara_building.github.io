# 第4次改修・追加調整

外観モードのみ調整しました。断面・ARCHIVESのページ、3D処理、モデルデータ、ロゴ画像は変更していません。公開・pushなし。

## 変更ファイル

- `index.html`：外観の日本語タイトル用にGoogle FontsのNoto Serif JPを追加。
- `assets/css/style.css`：ロゴを従来の50％に縮小。ARCHIVESの画像要素と同じ上端・右端の基準位置に調整。CONTENTSを150％、日本語タイトルを125％・游明朝優先に変更。すべて外観専用。
- `scripts/check-revision4-addition-browser.cjs`：寸法・書体指定・操作の検証。
- 本フォルダーの結果・スクリーンショット。

## 寸法と位置

| 項目 | 変更前 | 変更後 |
| --- | --- | --- |
| PCロゴ幅 | clamp(95px,12vw,175px) | clamp(47.5px,6vw,87.5px) |
| モバイルロゴ幅 | 100px | 50px |
| PCロゴ画像上端／右余白 | 35px／4vw | 43px／4vw |
| モバイルロゴ画像上端／右余白 | 25px／6vw | 29px／5vw |
| CONTENTS PC／モバイル | 14px／13px | 21px／19.5px |
| 日本語タイトル PC／モバイル／短い画面 | 11px／10px／9px | 13.75px／12.5px／11.25px |

ロゴの上端はARCHIVESヘッダーの上余白＋リンク内余白に合わせています（PC38+5px、モバイル25+4px）。
日本語書体は游明朝 → Noto Serif JP → serif。英字タイトルと日本語タイトルの左位置、既存の上下間隔は維持。
断面側の日本語タイトルは従来のNoto Sans JP・従来サイズです。

## 検証

ChromeヘッドレスでPC1366×768・1440×900・1920×1080、モバイル390×844・375×667を確認。
ロゴ50％と基準位置、CONTENTS150％・700・白・装飾なし、日本語タイトル125％・游明朝指定をcomputed styleで確認。
外観自動回転、右ドラッグ、ズーム、CONTENTSから断面、空から外観復帰、ARCHIVES9件のページ往復を回帰検証。
PC縦スクロールなし、ローカルHTTPエラー・JS例外なし。モデルのハッシュ一致、ARCHIVES全ファイルの変更なしを確認。

[PC外観](1366-exterior.png) ／ [スマートフォン外観](390-exterior.png) ／ [断面確認](1366-guide.png)

詳細は [results.json](results.json)、保全確認は [preserved-files.json](preserved-files.json)。
スマートフォンはエミュレーションです。游明朝未搭載環境ではNoto Serif JPを使用します。
変更前のファイルは `.local-backups/revision4-addition/` に保全しています。
