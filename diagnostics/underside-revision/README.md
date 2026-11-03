# 底面文字の2行・90度回転・拡大

実装の変更は `assets/js/underside-label.js` のみ。既存のGLB、カメラ・操作、UI、断面モデル、ARCHIVESページは変更していません。

- 文字ブロック全体を底面上で90度回転。鏡像反転なし。
- 「友だちに」「ならないか」の中央揃え2行。320pxの文字に336pxの行送りで、やや詰めた配置。
- 游ゴシック900を優先。Noto Sans JP Black 900のGoogle Fontsを底面用に読み込み、フォント待機後に描画。
- 白 #FFFFFF、テクスチャ1664×768px。
- 回転後の文字の横方向に当たる土台の奥行約18.67mの75％を使用。回転後のブロック全体が土台に収まるよう短辺方向にも上限を設定。
- 中心位置、3mmの底面オフセット、下向き片面、照明に依存しない材質と深度判定は維持。

## 検証

[下からの表示](exterior-below.png) ／ [通常視点](exterior-above.png) ／ [断面](guide-unchanged.png)

下から2行が正しい向きで読めることを画像確認。ブロックの実際の3D外接範囲が土台内にあることと、面の法線が下向きであることを検証。
文字の表示・非表示を比較し、上方では画像が完全一致、下方では文字が現れることを確認しました。
CONTENTSからの断面移行が動作し、断面側に文字がないこと、全5GLBのハッシュが以前と一致することを確認。JS例外なし。

詳細は [results.json](results.json)。検証スクリプトは `scripts/check-underside-revision.cjs`。
変更前は `.local-backups/underside-revision/underside-label.js` に保存。公開・pushなし。
