# ARCHIVES完成版指定の反映（2026-11-03）

プレビュー: http://127.0.0.1:4173/archives/

## 変更ファイル

- archives/index.html および全9件の詳細HTML：SAWARABAN no.1／no.2／no.3に統一。旧Google FontsリンクとArchivo Black先読みを除去。ファイル名・URLは維持。
- assets/js/archive-data.js：作品名と画像の代替テキストを変更。表紙の印刷文字や画像は変更なし。
- assets/css/archives.css：先頭のGoogle Fonts API @importでArimo 700とNoto Sans JP 700を読込み、--archive-fontを定義。競合する旧フォント指定を共通変数・太字へ整理。
- assets/css/archive-index.css：ホバー題名をclamp(12px,1.2vw,20.8px)へ変更。従来clamp(15px,1.5vw,26px)の正確な80％。白文字、中央配置、75％黒レイヤー、0.3秒を維持。
- assets/css/archive-shell.css：共通題字と情報欄にArimo/Noto 700。ロゴ下の白い1px線、80％白のカテゴリ文字と詰めた間隔。
- assets/js/archive-title.js：Arimo Boldの読込後に実際の幅を測り、回転後の題字を画面高さ87.5％へ調整。
- assets/js/archive-header.js：回転するリンクを専用スロットへ入れ、文字幅を測って重なりを防止。ロゴから25px空けて線を置き、線の下にカテゴリを配置。通常の線長200px、カテゴリ間22px。低い画面は線と余白を縮め、画面内に収める。
- assets/js/archive-detail.js：Free Paperの3詳細だけ関連号一覧を生成しない。他カテゴリの関連作品は維持。
- scripts/check-archives-final.cjs：表示・実フォント・タッチの検証。

## 確認結果

検証コマンド `node scripts/check-archives-final.cjs`。

1440×900、390×844、844×390で全9詳細ページを確認。一覧と詳細の題字座標・寸法が一致し、-90度・画面高さ87.5％。題字の単発0.7秒点灯と終了後の透明化、ホバー題名80％、黒75％オーバーレイ、カテゴリの件数と指定順、全作品復帰、詳細からのカテゴリ移動を検証。モバイルのタップ・動きを減らす設定でも動作。JavaScript例外なし。

Chrome DevTools ProtocolのCSS.getPlatformFontsForNodeで、英字の実描画にArimo（Arimo-Bold）、日本語の実描画にGoogle Fonts配信のNoto Sans JP（PostScript名 NotoSansJPThin-Bold、CSS weight 700）が使われていることを確認。ブラウザ内部のファミリー名にThinと含まれる場合があるが、実フェイスはBoldである。詳細はresults.json。

通常のカテゴリ文字はrgba(255,255,255,0.8)、選択／ホバー時は白100％。PCと縦長スマートフォンの線長は200px。横長の低い画面では画面高さに合わせて短縮。ロゴの位置・寸法は変更なし。

SAWARABAN全3詳細には関連号一覧がなく、作品名・CATEGORY・登録済みDATE／CREDITを維持。未登録情報は新たに作成していない。画像4枚、3Dトップ、カフェのファイルが作業前と同一ハッシュであることを確認。

## スクリーンショット

- 1440-list.png：PC一覧
- 1440-sawaraban-1.png：SAWARABAN no.1詳細と右ナビ
- 1440-category.png：Free Paper絞り込み
- 390-list.png、390-sawaraban-1.png：スマートフォン
- 844-*.png：高さの低い画面

元画像・PDF・リンク先URLは変更なし。旧フォント素材は削除せず未使用として保全。3D・カフェのデザインや動作は変更なし。Gitコミット・プッシュ・公開は行っていない。
