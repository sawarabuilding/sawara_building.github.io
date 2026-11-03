# SAWARA BUILDING / 鰆ビルヂング

トップページ完成版 v1.0。黒背景の建築模型と、実切断モデルから各階を選ぶCONTENTS、ARCHIVES一覧・9件の仮個別ページを持つ静的サイトです。
模型底面の文字は削除済みです。元のGLBの形状・素材は変更していません。

## ローカル確認

```powershell
npm.cmd run dev
```

http://127.0.0.1:4173/ を開きます。Three.jsは同梱済みで、表示のためのビルドやnpm installは不要です。
HTMLをダブルクリックせずHTTP経由で確認してください。

## 操作

- 外観：自動回転。右ドラッグ／1本指で回転、ホイール／ピンチでズーム。
- 右下のCONTENTSまたは模型のクリックで約1.8秒の断面移行。
- 断面：実際の床高さに沿った1F〜5Fを直接選択。空のクリックで外観へ復帰。
- 黒い地面のARCHIVESから一覧へ。資料9件のタイトルから独立ページへ。
- ARCHIVESの左タイトルは一覧／先頭へ、右ロゴは3Dトップへ戻ります。
- OSの動きを減らす設定に対応。外観右上のロゴはクリック無反応です。

## 更新箇所

| ファイル | 用途 |
| --- | --- |
| assets/js/floors.js | 階名・順序・URL・床高さ |
| assets/js/model-config.js | モデル・回転速度・カメラ・遷移時間 |
| assets/js/scene-layout.js | 断面のラベル・ARCHIVES表示 |
| assets/js/archive-data.js | 資料タイトル・画像・URL・説明・PDF |
| assets/css/style.css | トップページ |
| assets/css/archives.css | ARCHIVES共通デザイン |

未制作の地上テナントはURL未登録です。資料の画像・本文・PDFも未登録で、架空の内容は掲載していません。
現在の外観・断面GLBと、その表示に必要な画像・ライブラリを保存しています。
過去のモデル変換データ、試作モデル、キャッシュ、node_modulesは完成版コミットの対象外です。

## 検証と保存

[完成版の検証](diagnostics/final-v1/README.md)

ローカルサーバー起動後、依存パッケージ導入済みの環境で `npm.cmd run check:browser` を実行できます。
開発依存の再導入は `npm.cmd ci`。

保存ブランチ：`backup/top-page-v1-20261103`
コミットメッセージ：`SAWARA BUILDING - Top Page Complete v1.0`
mainとGitHub Pagesの設定を変更せず、バックアップブランチだけを対象とします。
復元する場合は作業中の変更を保全してから、このブランチをチェックアウトしてください。
