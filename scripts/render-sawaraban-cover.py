"""Read-only PDF rasterization. Source PDF and existing output are protected."""
import sys
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.local-cache' / 'python'))
import pypdfium2 as pdfium
from PIL import Image

source = ROOT / '.local-cache' / 'sawaraban-01-source.pdf'
output = ROOT / 'assets' / 'archives' / 'sawaraban-01' / 'cover.webp'
diagnostics = ROOT / 'diagnostics' / 'archives-cover'
diagnostics.mkdir(parents=True, exist_ok=True)
if output.exists():
    raise FileExistsError(f'Existing cover is protected: {output}')

before = hashlib.sha256(source.read_bytes()).hexdigest()
with pdfium.PdfDocument(source) as document:
    pages = []
    for index in range(len(document)):
        page = document[index]
        try:
            width, height = page.get_size()
            pages.append({'page': index + 1, 'points': [width, height],
                          'millimeters': [round(width * 25.4 / 72, 3), round(height * 25.4 / 72, 3)],
                          'mediaBox': list(page.get_mediabox()), 'cropBox': list(page.get_cropbox()),
                          'rotation': page.get_rotation()})
        finally:
            page.close()
    page = document[0]
    try:
        width, height = page.get_size()
        bitmap = page.render(scale=1400 / max(width, height))
        image = bitmap.to_pil().convert('RGB')
        # PDFium can round dimensions upward by a pixel; no cropping is used.
        target = (round(width * 1400 / max(width, height)), round(height * 1400 / max(width, height)))
        if image.size != target:
            image = image.resize(target, Image.Resampling.LANCZOS)
        image.save(diagnostics / 'page-1-reference.png')
        output.parent.mkdir(parents=True, exist_ok=True)
        # Lossless WebP keeps the PDF-rendered color, type and photographs exact.
        image.save(output, format='WEBP', lossless=True, method=6)
        decoded = Image.open(output).convert('RGB')
        assert decoded.size == image.size and decoded.tobytes() == image.tobytes()
        bitmap.close()
    finally:
        page.close()

assert hashlib.sha256(source.read_bytes()).hexdigest() == before
report = {'pageCount': len(pages), 'pages': pages, 'sourceBytes': source.stat().st_size,
          'sourceSha256': before, 'output': 'assets/archives/sawaraban-01/cover.webp',
          'outputPixels': list(image.size), 'outputBytes': output.stat().st_size,
          'webpMode': 'lossless', 'decodedPixelsMatchRender': True, 'sourceUnchanged': True,
          'cropped': False, 'renderer': 'PDFium via pypdfium2 5.14.0', 'pageRendered': 1}
(diagnostics / 'conversion.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=True))
