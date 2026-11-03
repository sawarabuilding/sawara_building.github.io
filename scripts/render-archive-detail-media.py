"""Render approved front/back PDF pages and selected event photos; never edit sources."""
from pathlib import Path
import sys,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.local-cache/python'))
from PIL import Image,ImageOps
import pypdfium2 as pdfium
report=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(im,source,relative,**metadata):
 target=ROOT/relative
 if target.exists():raise FileExistsError(target)
 im.thumbnail((1800,1800),Image.Resampling.LANCZOS)
 target.parent.mkdir(parents=True,exist_ok=True)
 im.save(target,'WEBP',quality=85,method=6)
 report.append(dict(file=relative,source=source.name,width=im.width,height=im.height,bytes=target.stat().st_size,sourceSha256=sha(source),**metadata))
for issue,source,pages in [(1,ROOT/'.local-cache/sawaraban-01-source.pdf',[1,2]),(2,ROOT/'.local-cache/archive-media/sawaraban-02.pdf',[2,1])]:
 before=sha(source)
 with pdfium.PdfDocument(source) as doc:
  for side,index in zip(['front','back'],pages):
   page=doc[index-1];w,h=page.get_size();bitmap=page.render(scale=1800/max(w,h));im=bitmap.to_pil().convert('RGB')
   im=im.resize((round(w*1800/max(w,h)),round(h*1800/max(w,h))),Image.Resampling.LANCZOS)
   save(im,source,f'assets/archives/sawaraban-{issue:02}/{side}.webp',pdfPage=index,pdfPageCount=len(doc),side=side)
   bitmap.close();page.close()
 assert sha(source)==before
selections={'nagata':['DSC_0929.jpg','DSC_0898.jpg','DSC_0900.jpg','DSC_0895.jpg','DSC_0919.jpg'],'seishin':['DSC_1763.jpg','DSC_1747.jpg','DSC_1750.jpg','DSC_1751.jpg','DSC_1759.jpg']}
for group,files in selections.items():
 for i,name in enumerate(files,1):
  source=ROOT/'.local-cache/archive-media'/group/name;before=sha(source)
  with Image.open(source) as original:save(ImageOps.exif_transpose(original).convert('RGB'),source,f'assets/archives/zine-{group}-2026/{i:02}.webp')
  assert sha(source)==before
source=ROOT/'assets/images/sawara-building-logo.png';target=ROOT/'assets/archives/sawara-building-logo.webp'
if target.exists():raise FileExistsError(target)
with Image.open(source) as im:im.save(target,'WEBP',lossless=True,method=6)
report.append(dict(file=target.relative_to(ROOT).as_posix(),source=source.name,bytes=target.stat().st_size,lossless=True))
out=ROOT/'diagnostics/archive-detail-media';out.mkdir(exist_ok=True)
(out/'generation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))
