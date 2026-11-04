# 外観モード：CONTENTSを右下へ

サイト実装の変更は `assets/css/style.css` の外観専用ルールのみです。
CONTENTSを右下へ右揃えで移動し、メッセージを上へ移しました。左下は空白です。
CONTENTSとメッセージの文字サイズ・書体・太さ・色は変更前のCSSとブラウザ上で比較し、一致を確認しました。
タイトル、ロゴ、HTML、JavaScript、断面表示、ARCHIVES各ページ、モデルデータは変更していません。

PC1366×768・1440×900・1920×1080、モバイル390×844・375×667で確認。
右端が揃い、メッセージとボタンが重ならないこと、PCの縦スクロールなし、CONTENTSから断面へ移行できることを確認しました。
自動回転・右ドラッグ・ズームも確認済み。断面側のARCHIVES位置は変更前CSSと一致。JS例外なし。
モバイルは画面エミュレーションでの確認です。公開・pushはしていません。

- [PC外観](1366-exterior.png)
- [モバイル外観](390-exterior.png)
- [検証結果](results.json)

検証スクリプト：`scripts/check-contents-right.cjs`。変更前CSS：`.local-backups/contents-right/style.css`。
