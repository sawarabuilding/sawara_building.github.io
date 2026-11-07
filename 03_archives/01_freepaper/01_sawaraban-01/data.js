// この資料の内容・画像・PDF・表示設定をまとめて編集します。
export default {
  "id": "sawaraban-1",
  "title": "SAWARABAN no.1",
  "category": "paper",
  "image": null,
  "cover": {
    "url": new URL("./images/front.webp", import.meta.url).href,
    "alt": "SAWARABAN no.1の表紙",
    "width": 1283,
    "height": 1800
  },
  "url": new URL("./", import.meta.url).href,
  "layout": {
    "offset": 15,
    "size": "medium",
    "width": "94%"
  },
  "images": [
    {
      "url": new URL("./images/front.webp", import.meta.url).href,
      "alt": "SAWARABAN no.1 表面"
    },
    {
      "url": new URL("./images/back.webp", import.meta.url).href,
      "alt": "SAWARABAN no.1 裏面"
    }
  ],
  "freePaper": {
    "number": 1,
    "pdfs": [
      new URL("./pdf/color01.pdf", import.meta.url).href,
      new URL("./pdf/color02.pdf", import.meta.url).href,
      new URL("./pdf/color03.pdf", import.meta.url).href
    ],
    "downloadName": "SAWARABAN_no01.pdf"
  },
  "facts": {
    "date": "2026.7",
    "credit": "SAWARA BUILDING",
    "memo": "この「古い友人」というのは、小学校の同級生のスミダというやつのことである。当時から面白い生き物だった。今も、僕を思い出した瞬間に突然電話をかけてくる。長電話をし、飽きると電話を終え、一年くらい音沙汰が無くなる。そして突然の長電話。その繰り返しだ。不思議な生き物である。色々、なんでも喋るが、しかし実際のところ、コイツが何を考えているか、僕は多分わかっていないじゃないかと思うと不思議だ。(舟木)"
  }
};
