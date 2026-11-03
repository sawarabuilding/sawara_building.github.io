"""Create the three requested WebP assets from read-only local source copies."""
import sys,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.local-cache/python'))
from PIL import Image,ImageOps
import pypdfium2 as pdfium

out=ROOT/'diagnostics/archives-media';out.mkdir(parents=True,exist_ok=True)
results=[]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def save(image,source,folder,kind,**extra):
    target=ROOT/'assets/archives'/folder/'cover.webp'
    if target.exists():raise FileExistsError(target)
    original_size=image.size
    size=tuple(round(v*1400/max(image.size)) for v in image.size)
    image=image.resize(size,Image.Resampling.LANCZOS)
    target.parent.mkdir(parents=True,exist_ok=True)
    if kind=='pdf':image.save(target,'WEBP',lossless=True,method=6)
    else:image.save(target,'WEBP',quality=90,method=6)
    results.append({'file':target.relative_to(ROOT).as_posix(),'sourceFilename':source.name,'kind':kind,'sourceSize':list(original_size),'outputSize':list(size),'bytes':target.stat().st_size,'sourceSha256':sha(source),'cropped':False,'colorAdjusted':False,**extra})
pdf_path=ROOT/'.local-cache/archive-media/sawaraban-02.pdf'
before=sha(pdf_path)
with pdfium.PdfDocument(pdf_path) as doc:
    page=doc[0]
    w,h=page.get_size();bitmap=page.render(scale=1400/max(w,h))
    image=bitmap.to_pil().convert('RGB')
    # Derive target ratio from PDF dimensions, not PDFium's rounded raster width.
    image=image.resize((round(w*1400/max(w,h)),round(h*1400/max(w,h))),Image.Resampling.LANCZOS)
    save(image,pdf_path,'sawaraban-02','pdf',pageCount=len(doc),pageMillimeters=[round(w*25.4/72,3),round(h*25.4/72,3)],pageRendered=1,compression='lossless')
    bitmap.close();page.close()
assert sha(pdf_path)==before
for group,filename,folder in [('nagata','DSC_0929.jpg','zine-nagata-2026'),('seishin','DSC_1759.jpg','zine-seishin-2026')]:
    source=ROOT/'.local-cache/archive-media'/group/filename;before=sha(source)
    with Image.open(source) as original:save(ImageOps.exif_transpose(original).convert('RGB'),source,folder,'photo',compression='quality 90')
    assert sha(source)==before
(out/'image-generation.json').write_text(json.dumps({'assets':results,'originalFilesUnchanged':True},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(results,ensure_ascii=True))
