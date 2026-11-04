// この資料の内容・画像・PDF・表示設定をまとめて編集します。
export default {
  "id": "sawaraban-2",
  "title": "SAWARABAN no.2",
  "category": "paper",
  "image": null,
  "cover": {
    "url": new URL("./images/front.webp", import.meta.url).href,
    "alt": "SAWARABAN no.2の表面",
    "width": 1273,
    "height": 1800
  },
  "url": new URL("./", import.meta.url).href,
  "layout": {
    "offset": 0,
    "size": "medium",
    "width": "89%"
  },
  "images": [
    {
      "url": new URL("./images/front.webp", import.meta.url).href,
      "alt": "SAWARABAN no.2 表面"
    },
    {
      "url": new URL("./images/back.webp", import.meta.url).href,
      "alt": "SAWARABAN no.2 裏面"
    }
  ],
  "freePaper": {
    "number": 2,
    "pdfs": [
      new URL("./pdf/color01.pdf", import.meta.url).href,
      new URL("./pdf/color02.pdf", import.meta.url).href,
      new URL("./pdf/color03.pdf", import.meta.url).href
    ],
    "downloadName": "SAWARABAN_no02.pdf"
  },
  "facts": {
    "date": "2026.9",
    "credit": "SAWARA BUILDING"
  }
};
