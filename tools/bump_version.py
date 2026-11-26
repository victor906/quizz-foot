#!/usr/bin/env python3
"""Met à jour le numéro de version partout d'un coup.

Usage : python3 tools/bump_version.py 5.1

- texte « Version X » en bas de l'accueil
- paramètre ?v=X sur les fichiers CSS/JS (force les téléphones à recharger)
- APP_VERSION dans app.js et version.json (détection des mises à jour)
- nom du cache du service worker
"""
import json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
v = sys.argv[1]

p = root / "index.html"
s = p.read_text(encoding="utf8")
s = re.sub(r"Version [0-9.]+", f"Version {v}", s)
s = re.sub(r'(<script src="[\w.-]+\.js)(\?v=[0-9.]+)?(")', rf"\1?v={v}\3", s)
s = re.sub(r'(href="style\.css)(\?v=[0-9.]+)?(")', rf"\1?v={v}\3", s)
p.write_text(s, encoding="utf8")

p = root / "app.js"
s = p.read_text(encoding="utf8")
s = re.sub(r'const APP_VERSION = "[0-9.]+";', f'const APP_VERSION = "{v}";', s)
p.write_text(s, encoding="utf8")

(root / "version.json").write_text(json.dumps({"version": v}) + "\n", encoding="utf8")

p = root / "sw.js"
s = p.read_text(encoding="utf8")
s = re.sub(r'const CACHE = "foot-quizz-[\w.]+";', f'const CACHE = "foot-quizz-{v}";', s)
p.write_text(s, encoding="utf8")
print("version", v)
