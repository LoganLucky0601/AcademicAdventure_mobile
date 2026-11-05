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
styles = "".join(f'<link rel="stylesheet" href="{name}.css">\n' for name in ("mobile", "loading"))
html = html.replace("</head>", styles + "</head>")
interface = "".join((web / filename).read_text(encoding="utf-8")
                    for filename in ("loading.html", "controls.html"))
html = html.replace("</body>", interface + "</body>")
index.write_text(html, encoding="utf-8")
for filename in ("mobile.css", "mobile.js", "loading.css", "loading.js"):
    shutil.copyfile(web / filename, output / filename)

sounds = web.parent / "Academic Adventure" / "assets" / "sounds"
shutil.copytree(sounds, output / "sounds", dirs_exist_ok=True)
