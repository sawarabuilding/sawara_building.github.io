// Create missing index.html shells; existing pages are never overwritten.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL,fileURLToPath}=require('node:url');
const root=path.resolve(__dirname,'../..');
(async()=>{
 const {ARCHIVE_ITEMS}=await import(pathToFileURL(path.join(root,'03_archives/data.js')));
 const template=fs.readFileSync(path.join(root,'03_archives/01_freepaper/01_sawaraban-01/index.html'),'utf8');
 for(const item of ARCHIVE_ITEMS){
  const file=fileURLToPath(new URL('index.html',item.url));
  if(!file.startsWith(root+path.sep))throw Error('Outside site');
  if(fs.existsSync(file))continue;
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const title=item.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  fs.writeFileSync(file,template.replace(/data-archive-detail="[^"]*"/,'data-archive-detail="'+item.id+'"').replace(/<title>.*?<\/title>/,'<title>'+title+' | SAWARA BUILDING ARCHIVES</title>'));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
