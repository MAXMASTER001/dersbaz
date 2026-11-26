#!/usr/bin/env python3
"""Dersbaz'ı tek bir HTML dosyasında toplar (USB, Android, e-posta için).

Kullanım:  python3 tek-dosya-yap.py
Çıktı:     dist/Dersbaz.html  (bu tek dosyayı kopyalamanız yeterli)
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')

import base64
MIME = {'.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml'}
n_assets = 0

def inline_css(m):
    path = ROOT / m.group(1)
    css = path.read_text(encoding='utf-8')
    def embed(u):
        global n_assets
        ref = u.group(1).strip('\'"')
        if ref.startswith(('data:', 'http:', 'https:')):
            return u.group(0)
        f = (path.parent / ref).resolve()
        data = base64.b64encode(f.read_bytes()).decode('ascii')
        n_assets += 1
        return f"url(data:{MIME.get(f.suffix, 'application/octet-stream')};base64,{data})"
    css = re.sub(r'url\(([^)]+)\)', embed, css)
    return '<style>\n' + css + '\n</style>'

def inline_js(m):
    js = (ROOT / m.group(1)).read_text(encoding='utf-8')
    js = js.replace('</script', '<\\/script')
    return '<script>\n/* ' + m.group(1) + ' */\n' + js + '\n</script>'

html, n_css = re.subn(r'<link rel="stylesheet" href="(css/[^"?]+)(?:\?[^"]*)?">', inline_css, html)
html, n_js = re.subn(r'<script src="(js/[^"?]+)(?:\?[^"]*)?"></script>', inline_js, html)

if re.search(r'(src|href)="(js|css)/', html):
    sys.exit('HATA: gömülemeyen yerel dosya bağlantısı kaldı.')

out = ROOT / 'dist' / 'Dersbaz.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
if 'fonts.googleapis.com' in html:
    print('UYARI: sayfa hâlâ internetten font istiyor.')
print(f'{n_css} stil, {n_js} betik, {n_assets} font/görsel gömüldü -> {out} ({out.stat().st_size // 1024} KB)')
