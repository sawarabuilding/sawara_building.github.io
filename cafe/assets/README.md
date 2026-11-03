# 仮素材の出典と差し替え

`illustrations/plate.svg`、`cup.svg`、`tomatoes.svg`、`cutlery.svg` は今回の試作用に作成したオリジナルSVGです。
外部サイトの画像・ロゴ・写真は使用していません。この4点はこのリポジトリ内でCC0 1.0として提供します。
ライセンス説明：https://creativecommons.org/publicdomain/zero/1.0/

店舗の実物・実際の料理を示す資料ではなく、動きを確認する仮イラストです。
現在の背景写真は、ユーザー指定の `000016.JPG` を無編集でコピーした `images/000016.jpg` です。
この写真は上記SVGのCC0対象ではありません。元画像は変更・削除せず、サイト内の相対パスで使用しています。
ABOUT・MENUの店舗写真は引き続き未登録で、HTML/CSSのプレースホルダーです。旧SVGは保全し、現在の背景では使用しません。
正式ロゴのみ既存の `assets/images/sawara-building-logo.png` を参照し、その権利・元データは変更していません。

新しい写真は `images/`、イラストは `illustrations/` に個別配置し、`../cafe-data.js` のimageへ相対URLを設定してください。
追加時は撮影者・取得元・使用条件をここに追記します。
