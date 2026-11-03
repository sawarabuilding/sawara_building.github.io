# ARCHIVES詳細画像の拡充

プレビュー: http://127.0.0.1:4173/archives/

## 変更ファイル

- assets/js/archive-data.js：1・2号の表裏画像、イベントの5枚の画像配列、イベントdescription（初期値は空文字）、一覧の表面参照、ARCHIVES専用WebPロゴ参照。
- assets/js/archive-detail.js：Exhibitionの関連作品一覧を生成しない。空白のみのdescriptionも非表示。説明文用のクラスを設定。
- assets/css/archive-shell.css：説明文を14px／行間1.6／白88％／共通Arimo・Noto 700に設定。
- archives/index.htmlと全9詳細HTML：ロゴ画像だけを透過WebP版へ参照変更。位置・大きさ・リンクは変更なし。
- scripts/render-archive-detail-media.py、scripts/check-archive-detail-media.cjs：画像生成と動作確認。

一覧のExhibition代表画像は従来のcover.webpを維持。既存WebPや元PNG・JPEG・PDFは削除・再圧縮していない。ARCHIVESで実際に参照するラスター画像はロゴを含めてすべてWebP。

## 新規WebP画像（15点）

- assets/archives/sawaraban-01/front.webp、back.webp
- assets/archives/sawaraban-02/front.webp、back.webp
- assets/archives/zine-nagata-2026/01.webp、02.webp、03.webp、04.webp、05.webp
- assets/archives/zine-seishin-2026/01.webp、02.webp、03.webp、04.webp、05.webp
- assets/archives/sawara-building-logo.webp

作品画像は品質85・長辺1800px以下、縦横比維持・トリミングなし・色調補正なし。写真のEXIF回転を反映。ロゴは透明な背景と輪郭を保つ可逆圧縮。全ファイルの寸法・容量・元資料ハッシュはgeneration.jsonに記録。

## PDFの対応

| 号 | 元PDF | 表面 | 裏面 |
| --- | --- | --- | --- |
| no.1 | 1号 2026.7／三色.pdf（全6ページ） | 1ページ | 2ページ |
| no.2 | 2号 2026.9／260925_フリーペーパー_02_橙.pdf（全2ページ） | 2ページ | 1ページ |

no.1は緑・赤・青の表裏3組。既存の緑の表紙に合わせ、1・2ページを採用。no.2は2ページ目に写真・題字・発行情報があり、1ページ目が本文面のため、PDF順とは逆に表示。画像内に印刷された文字や向きは変更していない。

no.3は元PDF未確認。指定のフリーペーパーフォルダーを再帰確認したが、1・2号のPDFのみだった。仮画像は作らず既存の資料準備中表示を維持。no.3の両面PDFまたは表裏の元画像と対応が必要。

## 写真の選定・順序

| 番号 | 長田の元ファイル | 西神中央の元ファイル |
| --- | --- | --- |
| 01 | DSC_0929.jpg | DSC_1763.jpg |
| 02 | DSC_0898.jpg | DSC_1747.jpg |
| 03 | DSC_0900.jpg | DSC_1750.jpg |
| 04 | DSC_0895.jpg | DSC_1751.jpg |
| 05 | DSC_0919.jpg | DSC_1759.jpg |

長田は入口→会場建築→ブースと交流→冊子→展示の細部、西神中央は会場全景→ブース→出版物→木製サイン→販売テーブルの手元。単なる類似構図の連続を避けた。selected-photos.jpgで一覧確認できる。

## 説明文の編集

assets/js/archive-data.jsのイベント項目（id: zine-fes-2026／seishin-2026）の `description:''` に150〜300字程度の文章を入力する。PLACEを含む情報リストの直後に表示される。空文字または空白のみなら要素自体を作らないため、説明文用の余白も発生しない。文章は今回創作・入力していない。

## 検証

`node scripts/check-archive-detail-media.cjs` 成功。1440×900、390×844、844×390で全9件を確認。1・2号は2枚、イベントは5枚、すべて画像decode成功。両カテゴリの関連一覧は非表示。カテゴリ絞り込み・表示順・戻り・題字・実フォント・75％ホバー・タッチ操作を維持。説明文150字／300字をブラウザ検証時だけ仮注入し、幅と行間を確認（実ファイルには保存しない）。JavaScript例外なし。

## スクリーンショット

- 1440-sawaraban-1.png：no.1の表裏
- 1440-sawaraban-2.png：no.2の表裏
- 1440-zine-fes-2026.png：長田の5枚
- 1440-seishin-2026.png：西神中央の5枚
- 390-*.png：スマートフォン
- 1440-list.png：一覧

変更はARCHIVESの表示と画像に限定。TOP・CAFE・他テナントの画像／ページには変更を加えていない。元資料は保全。Gitコミット・プッシュ・公開は行っていない。
