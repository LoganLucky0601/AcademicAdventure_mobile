"""Add the touch interface to the generated Pygbag page."""
from pathlib import Path
import shutil
import sys

output = Path(sys.argv[1])
web = Path(__file__).resolve().parents[1] / "web"
index = output / "index.html"
html = index.read_text(encoding="utf-8")
if html.count("</head>") != 1 or html.count("</body>") != 1:
    raise ValueError("Unexpected Pygbag HTML template")
html = html.replace("</head>", '<link rel="stylesheet" href="mobile.css">\n</head>')
html = html.replace("</body>", (web / "controls.html").read_text(encoding="utf-8") + "</body>")
index.write_text(html, encoding="utf-8")
for filename in ("mobile.css", "mobile.js"):
    shutil.copyfile(web / filename, output / filename)

sounds = web.parent / "Academic Adventure" / "assets" / "sounds"
shutil.copytree(sounds, output / "sounds", dirs_exist_ok=True)
