// 掲載順はこの配列で管理します。資料の内容は各フォルダーの data.js を編集します。
import item0 from './01_freepaper/01_sawaraban-01/data.js';
import item1 from './02_architecture/01_building-01/data.js';
import item2 from './03_exhibition/01_zine-nagata-2026/data.js';
import item3 from './05_magazine/01_magazine-01/data.js';
import item4 from './04_money/01_report-2026/data.js';
import item5 from './01_freepaper/03_sawaraban-03/data.js';
import item6 from './02_architecture/02_building-02/data.js';
import item7 from './03_exhibition/02_zine-seishin-2026/data.js';
import item8 from './02_architecture/03_building-03/data.js';
import item9 from './01_freepaper/02_sawaraban-02/data.js';
export const ARCHIVE_ITEMS=[item0,item1,item2,item3,item4,item5,item6,item7,item8,item9];
export const ARCHIVE_FACTS=Object.fromEntries(ARCHIVE_ITEMS.map(item=>[item.id,item.facts]));
export const FREE_PAPERS=Object.fromEntries(ARCHIVE_ITEMS.filter(item=>item.freePaper).map(item=>[item.id,item.freePaper]));
export const ARCHIVE_CATEGORIES={
  "paper": "FREE PAPER",
  "event": "EVENT",
  "architecture": "ARCHITECTURE",
  "money": "MONEY",
  "magazine": "MAGAZINE"
};
export const ARCHIVE_NAV=[
  {
    "id": "paper",
    "label": "Free Paper",
    "directory": "01_freepaper"
  },
  {
    "id": "event",
    "label": "Exhibition",
    "directory": "03_exhibition"
  },
  {
    "id": "architecture",
    "label": "Architecture",
    "directory": "02_architecture"
  },
  {
    "id": "money",
    "label": "Money",
    "directory": "04_money"
  },
  {
    "id": "magazine",
    "label": "MAGAZINE",
    "directory": "05_magazine"
  }
];
export const DEFAULT_ARCHIVE_MEMO="このページには、制作や展示にまつわる記録を掲載する予定です。制作のきっかけ、準備の過程、そのとき考えていたこと、会場で起こった出来事などを、写真とともに残していきます。作品そのものだけでなく、完成までの時間や偶然も、鰆ビルヂングの記録として蓄積していきたいと考えています。";
export const ARCHIVE_BRAND={logoUrl:new URL('../90_shared/archives/sawara-building-logo.webp',import.meta.url).href};
export const ARCHIVE_HOME=new URL('./',import.meta.url).href;
export const SITE_HOME=new URL('../',import.meta.url).href;
export const CATEGORY_URLS=Object.fromEntries(ARCHIVE_NAV.map(c=>[c.id,new URL('./'+c.directory+'/',import.meta.url).href]));
