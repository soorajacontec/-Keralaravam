"""Rebuild ../index.html from dev/app.html.

Usage (from the repository root):  python3 dev/build.py

app.html holds the whole app (HTML, CSS and JS). loops.json lists the built-in
recordings in ../audio/ with their loop points. After rebuilding, bump CACHE in
../sw.js (for example keralaravam-v49) so installed copies pick up the change.
"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
src = open(os.path.join(here, 'app.html'), encoding='utf-8').read()
loops = json.load(open(os.path.join(here, 'loops.json'), encoding='utf-8'))
src = src.replace('/*LOOPS*/{}/*END*/', json.dumps(loops))
head, body = src.split('<!--BODY-->')
pwa_head = open(os.path.join(here, 'head.html'), encoding='utf-8').read()
doc = '<!doctype html>\n<html lang="en">\n<head>\n' + pwa_head + head + '</head>\n<body>\n' + body + '</body>\n</html>\n'
open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(doc)
print('index.html written,', len(doc), 'bytes')
