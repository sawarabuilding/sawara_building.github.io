// Archive entries and detail media. Free-paper download settings are below.
// Entries keep their reading order; layout changes scale and spacing, not categories.
export const ARCHIVE_BRAND={logoUrl:new URL('../archives/sawara-building-logo.webp',import.meta.url).href};
export const ARCHIVE_CATEGORIES={paper:'FREE PAPER',event:'EVENT',architecture:'ARCHITECTURE',money:'MONEY',magazine:'MAGAZINE'};
export const ARCHIVE_NAV=[{id:'paper',label:'Free Paper'},{id:'event',label:'Exhibition'},{id:'architecture',label:'Architecture'},{id:'money',label:'Money'},{id:'magazine',label:'MAGAZINE'}];
export const ARCHIVE_FACTS={
 'magazine-1':{categoryLabel:'Magazine',publicationDate:'2026.7.19',memoPosition:'last',memo:'このページには、制作や展示にまつわる記録を掲載する予定です。制作のきっかけ、準備の過程、そのとき考えていたこと、会場で起こった出来事などを、写真とともに残していきます。作品そのものだけでなく、完成までの時間や偶然も、鰆ビルヂングの記録として蓄積していきたいと考えています。',productionCredits:[
  // Romanizations follow the supplied magazine cover, including activity names.
  {label:'EDITED BY',names:['Kentaro FUNAKI','Tomoya KITAOKA','USAKI']},
  {label:'WRITTEN BY',names:['Kentaro FUNAKI','Tomoya KITAOKA','USAKI','Oden Chan','Oton','Rariatto Magatama','Taiga ONO','Kirakira Situation','Hironobu CHOJI','Tomoaki CHOJI','Yusuke MORIYA','Xan','Yuki san']},
  // Provisional romanizations supplied by the user; confirm final spellings later.
  {label:'SPECIAL THANKS',names:['Makoto TAKEMOTO','Kanato OGURA','Ryu SHIBASAKI','Taiga KUMASAKA','Issei NAGAI'],note:'ありがとう。'},
  {label:'PRINTED BY',names:['Graphic Printing']},
  {label:'PUBLISHED BY',names:['SAWARA BUILDING']}
 ]},
 'sawaraban-1':{date:'2026.7',credit:'SAWARA BUILDING'},
 'sawaraban-2':{date:'2026.9',credit:'SAWARA BUILDING'},
 'zine-fes-2026':{date:'2026.7.19–20',place:'長田'},
 'seishin-2026':{date:'2026.9.26',place:'西神中央'},
 'money-2026':{date:'2026'}
};
// Set each item's memo to replace the placeholder; an explicit empty string hides it.
export const DEFAULT_ARCHIVE_MEMO='このページには、制作や展示にまつわる記録を掲載する予定です。制作のきっかけ、準備の過程、そのとき考えていたこと、会場で起こった出来事などを、写真とともに残していきます。作品そのものだけでなく、完成までの時間や偶然も、鰆ビルヂングの記録として蓄積していきたいと考えています。';
const NAGATA_MEMO='コデックス装に使う、折丁、断裁のみが済んだ冊子（スクラム製本）が7部ずつくらい到着しました。ページ中央に糸を通す穴を開け、順番に積み重ね、リンクステッチと呼ばれる縫い方で一冊ずつ縫い合わせていきます。異形サイズのページやトレーシングペーパーも組み込み、位置がズレないよう慎重に確認。最後に自作の治具で圧縮し、背固めをして完成です。圧倒的な手間暇を掛けた、我々の汗の結晶です。';
export const ARCHIVE_ITEMS=[
  {id:'sawaraban-1',title:'SAWARABAN no.1',category:'paper',image:null,cover:{url:'../assets/archives/sawaraban-01/front.webp',alt:'SAWARABAN no.1の表紙',width:1283,height:1800},url:'./sawaraban-1.html',layout:{offset:15,size:'medium',width:'94%'}},
  {id:'building-1',title:'building #1',category:'architecture',image:null,url:'./building-1.html',layout:{offset:145,size:'large',width:'100%',italic:true}},
  {id:'zine-fes-2026',title:'2026.7.19-20 ZINEフェス',hoverTitle:'2026.7.19-20 ZINEフェス 長田',category:'event',memo:NAGATA_MEMO,description:'',image:null,cover:{url:'../assets/archives/zine-nagata-2026/cover.webp',alt:'ZINEフェス長田の会場入口に設置されたSAWARAのサイン',width:1200,height:1400,displayWidth:'22vw'},url:'./zine-fes-2026.html',layout:{offset:62,size:'small',width:'89%'}},
  {id:'magazine-1',title:'SAWARA BUILDING MAGAZINE #1',category:'magazine',cover:{url:'../assets/archives/magazine-1/magazine-1-cover.webp',alt:'SAWARA BUILDING MAGAZINE #1',width:1558,height:2200},url:'./work.html?id=magazine-1',randomImages:{count:5,candidates:Array.from({length:20},(_,i)=>({url:`../assets/archives/magazine-1/magazine-1-${String(i+1).padStart(2,'0')}.webp`,alt:`SAWARA BUILDING MAGAZINE #1 ${i+1}`}))},layout:{offset:70,size:'medium',width:'94%'}},
  {id:'money-2026',title:'収支報告書2026',category:'money',image:null,url:'./money-2026.html',layout:{offset:110,size:'small',width:'90%'}},
  {id:'sawaraban-3',title:'SAWARABAN no.3',category:'paper',image:null,url:'./sawaraban-3.html',layout:{offset:12,size:'large',width:'100%'}},
  {id:'building-2',title:'building #2',category:'architecture',image:null,url:'./building-2.html',layout:{offset:165,size:'medium',width:'93%'}},
  {id:'seishin-2026',title:'2026.9.26 西神中央',hoverTitle:'2026.9.26 ZINEフェス 西神中央',category:'event',description:'',image:null,cover:{url:'../assets/archives/zine-seishin-2026/cover.webp',alt:'ZINEフェス西神中央のブースに並ぶ冊子と接客の手元',width:1400,height:934,displayWidth:'25vw'},url:'./seishin-2026.html',layout:{offset:30,size:'medium',width:'90%'}},
  {id:'building-3',title:'building #3',category:'architecture',image:null,url:'./building-3.html',layout:{offset:130,size:'large',width:'100%',italic:true}},
  {id:'sawaraban-2',title:'SAWARABAN no.2',category:'paper',image:null,cover:{url:'../assets/archives/sawaraban-02/front.webp',alt:'SAWARABAN no.2の表面',width:1273,height:1800},url:'./sawaraban-2.html',layout:{offset:0,size:'medium',width:'89%'}},
];

// Detail-page images are independent of the single cover used by the index.
// Exhibition text is edited in each event entry's description above (150–300 Japanese characters).
const detailImages={
 'sawaraban-1':[
  {url:'../assets/archives/sawaraban-01/front.webp',alt:'SAWARABAN no.1 表面'},
  {url:'../assets/archives/sawaraban-01/back.webp',alt:'SAWARABAN no.1 裏面'}],
 'sawaraban-2':[
  {url:'../assets/archives/sawaraban-02/front.webp',alt:'SAWARABAN no.2 表面'},
  {url:'../assets/archives/sawaraban-02/back.webp',alt:'SAWARABAN no.2 裏面'}],
 'zine-fes-2026':[
  {url:'../assets/archives/zine-nagata-2026/01.webp',alt:'長田の会場入口とSAWARAのサイン'},
  {url:'../assets/archives/zine-nagata-2026/02.webp',alt:'長田の会場建築を見上げた風景'},
  {url:'../assets/archives/zine-nagata-2026/03.webp',alt:'長田の展示ブースと会場の様子'},
  {url:'../assets/archives/zine-nagata-2026/04.webp',alt:'長田で展示された冊子'},
  {url:'../assets/archives/zine-nagata-2026/05.webp',alt:'長田の展示ポスターの細部'}],
 'seishin-2026':[
  {url:'../assets/archives/zine-seishin-2026/01.webp',alt:'西神中央の会場全景'},
  {url:'../assets/archives/zine-seishin-2026/02.webp',alt:'西神中央のSAWARA展示ブース'},
  {url:'../assets/archives/zine-seishin-2026/03.webp',alt:'西神中央のテーブルに並ぶフリーペーパーと冊子'},
  {url:'../assets/archives/zine-seishin-2026/04.webp',alt:'西神中央で使用した木製サインの細部'},
  {url:'../assets/archives/zine-seishin-2026/05.webp',alt:'西神中央の販売テーブルと接客の手元'}]
};
for(const item of ARCHIVE_ITEMS)if(detailImages[item.id])item.images=detailImages[item.id];

// PDF paths are relative to this module, including on subdirectory hosting.
export const FREE_PAPERS={
 'sawaraban-1':{number:1,pdfs:['../freepaper/no01/color01.pdf','../freepaper/no01/color02.pdf','../freepaper/no01/color03.pdf'],downloadName:'SAWARABAN_no01.pdf'},
 'sawaraban-2':{number:2,pdfs:['../freepaper/no02/color01.pdf','../freepaper/no02/color02.pdf','../freepaper/no02/color03.pdf'],downloadName:'SAWARABAN_no02.pdf'},
 'sawaraban-3':{number:3,pdfs:[],downloadName:'SAWARABAN_no03.pdf'}
};
for(const item of ARCHIVE_ITEMS){
 const paper=FREE_PAPERS[item.id];
 if(paper)item.freePaper={...paper,pdfs:paper.pdfs.map(path=>new URL(path,import.meta.url).href)};
}
