# 断面案内：1Fリンク分離・ARCHIVES右寄せ・名称125％

変更した実装ファイルは次の3点です。

- `assets/js/floors.js`：1Fに `tenants` 配列を追加。CAFEは `./cafe/index.html`、BIKEは `url:null`。
- `assets/js/directory.js`：1Fを独立したCAFE／BIKEの要素として描画。URL登録済みの項目だけ実リンクになります。
- `assets/css/style.css`：ARCHIVESを右4vwへ移動、Y座標と文字設定は維持。名称を游ゴシック優先・PC13.75px／モバイル10px（変更前11px／8pxの125％）に設定。

CAFEとBIKEのホバー・キーボードフォーカスは独立。表示は一行、間隔は0.65em。
BIKEは未制作のためhrefを設定せず、準備中の説明とaria-disabledを付与しています。クリックしてもCAFEへ誤遷移しません。
将来、`floors.js` の1F `tenants` 内の `{id:'bike', ... url:null}` を制作済みページへの相対URLに変えるだけで有効になります。
架空のページ・ダミーリンク・新しい通知画面は作成していません。

## 検証

PC1366×768・1440×900・1920×1080、モバイル390×844・375×667で、変更前CSSとの実測比較を行いました。

- ARCHIVESのY座標・書体・サイズ・色は一致。右端の余白が変更前の左余白と一致。
- 全名称の文字サイズは125％、游ゴシック優先、階数サイズ・階のX位置と縦方向の中心・文字色は一致。
- 3Fを含め全名称が一行かつ画面内。スマートフォンのみ3Fの字間を詰め、階数位置を維持しています。
- CAFEとBIKEは別々のホバー範囲。BIKEクリックでカフェに移動しないこと、CAFEからカフェへ移動することを確認。
- 3D制御JS・カメラ設定・全GLB・ARCHIVES各HTMLはハッシュ一致。ブラウザJS例外なし。

[PC画面](1366-guide.png) ／ [スマートフォン](390-guide.png) ／ [実測結果](results.json)

プレビュー：http://127.0.0.1:4173/ → CONTENTS。
検証：`node scripts/check-guide-links.cjs`。変更前は `.local-backups/guide-links/` に保全しています。
コミット・push・公開なし。実機スマートフォンは未検証です。
