// Prototype content only. Replace the values here when approved content is ready.
export const SECTIONS=[
  {id:'about',label:'ABOUT',eyebrow:'キッチン フラミンゴについて',title:'ABOUT',
    paragraphs:['SAWARA BUILDINGの1Fに入居するカフェ、キッチン フラミンゴ。','お店の紹介文を、ここに掲載します。内容は準備中です。'],image:null,imageAlt:'キッチン フラミンゴの店舗写真'},
  {id:'menu',label:'MENU',eyebrow:'お食事とお飲み物',title:'MENU',items:[]},
  {id:'contact',label:'CONTACT',eyebrow:'お店のご案内',title:'CONTACT',fields:[
    {label:'ADDRESS',text:'住所は準備中です。'},
    {label:'OPENING HOURS',text:'営業時間・定休日は準備中です。'},
    {label:'EMAIL',text:'メールアドレスは未設定です。',url:null},
    {label:'INSTAGRAM',text:'Instagramアカウントは未設定です。',url:null},
  ]},
];

// Two columns, read left-to-right. No new destinations are added.
export const TABLE_ITEMS=[
  {label:'about',section:'about'}, {label:'reserve'},
  {label:'contact',section:'contact'}, {label:'instagram'},
];

// All background slots use the user-provided photograph at 125% of prior widths.
// No rotation, crop or image editing. Positions remain independently configurable.
export const BACKGROUND_ITEMS=[
  {id:'plate',image:'./assets/images/000016.jpg',label:'背景写真',x:15,y:22,width:300,angle:0,drift:19,speed:1,scroll:.14,parallax:8,mobile:{x:26,y:16,width:181.25}},
  {id:'cup',image:'./assets/images/000016.jpg',label:'背景写真',x:79,y:20,width:256.25,angle:0,drift:15,speed:.8,scroll:-.11,parallax:-9,mobile:{x:78,y:32,width:156.25}},
  {id:'tomatoes',image:'./assets/images/000016.jpg',label:'背景写真',x:69,y:80,width:318.75,angle:0,drift:14,speed:.7,scroll:.17,parallax:10,mobile:{x:70,y:84,width:193.75}},
  {id:'cutlery',image:'./assets/images/000016.jpg',label:'背景写真',x:20,y:78,width:200,angle:0,drift:17,speed:.9,scroll:-.13,parallax:6,mobile:{x:22,y:67,width:131.25}},
  {id:'photo',image:'./assets/images/000016.jpg',label:'背景写真',x:89,y:53,width:225,angle:0,drift:12,speed:.6,scroll:.09,parallax:-6,mobile:{x:75,y:56,width:118.75}},
];
