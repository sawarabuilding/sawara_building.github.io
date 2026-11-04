# ARCHIVES共通レイアウト・カテゴリ改修

プレビュー: http://127.0.0.1:4173/archives/

## 変更ファイル

- archives/index.html、sawaraban-1.html、sawaraban-2.html、sawaraban-3.html、zine-fes-2026.html、seishin-2026.html、building-1.html、building-2.html、building-3.html、money-2026.html：共通CSS、共通題字コンテナ、太字フォント読み込み。
- assets/css/archive-shell.css（新規）：一覧と詳細で共通の固定題字・ロゴ・右カテゴリ、詳細情報＋画像のレイアウト、0.7秒で一度だけ白く光って消える題字。
- assets/css/archive-index.css：題字関連を共通CSSへ移し、画像上の黒オーバーレイを75％へ変更。
- assets/js/archive-header.js：共通題字初期化・カテゴリナビゲーション生成。
- assets/js/archive-data.js：カテゴリ定義・確認済みの日付／場所／発行表記。未知の事実は追加しない。
- assets/js/archives.js：URLのcategoryパラメータによる絞り込み、カテゴリごとの指定順、全作品への復帰、ブラウザ履歴への対応。
- assets/js/archive-detail.js：小さな情報欄、同カテゴリ内の作品リンク、既存表紙／イベント写真の大きな表示。images配列で複数画像に対応し、未登録画像・PDFのダミーは作成しない。
- scripts/check-archive-shell.cjs：ブラウザ検証。

## 動作

左題字はArchivo Black・-90度・画面高さ87.5％・白輪郭1.2px。すべてのページで同じ位置と寸法。クリックでカテゴリを解除した一覧に戻る。題字のホバーは0.7秒の単発アニメーションで、置いたままでも透明に戻る。再入場で再生。動きを減らす設定では点灯アニメーションを停止。

右上ロゴの画面座標・サイズは維持し、スクロール時も固定。カテゴリはFree Paper／Exhibition／Architecture／Money。詳細からカテゴリリンクを押すと絞り込み済み一覧へ遷移。一覧の全作品表示は既存の不規則な配置を維持し、絞り込み中のみ順序を明確にした縦方向の一覧。

## 検証とスクリーンショット

`node scripts/check-archive-shell.cjs`。1440×900、390×844、844×390で全9詳細ページを確認。題字の実測座標・サイズ一致、-90度、カテゴリ4種の件数と表示順、全作品復帰、詳細からカテゴリへの遷移、75％黒オーバーレイ、点灯後に透明へ戻ること、画像読み込み、横方向のはみ出しなし、JavaScript例外なしを検証。タッチ環境と動きを減らす設定でも、カテゴリ／題字／作品の2段階タップが動作。

- 1440-list.png：一覧
- 1440-category.png：Free Paper選択時
- 1440-sawaraban-1.png、1440-sawaraban-2.png：フリーペーパー詳細
- 1440-zine-fes-2026.png、1440-seishin-2026.png：展示詳細
- 390-*.png：スマートフォン
- results.json：検証結果

## 掲載資料の範囲

今回の詳細画像は既存の1号・2号表紙とイベント写真2枚を使用。PDF全ページの新規画像化は行っていない。複数画像はarchive-data.jsの各項目にimages配列を追加すると縦方向に表示できる。未確認の主催者・場所・概要・連絡先などは捏造せず未掲載。

指示書に記載された3枚の添付画像は受領フォルダーになく、文章の指定と参考サイト https://darrenoorloff.com/Identity-Archive を基準に実装。3Dトップ、カフェ、元の画像／GLBは変更していない。既存の未コミット変更を保持。コミット・プッシュ・公開は行っていない。
