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
# Keep the landing screen visible until the player explicitly enters.
media_gate = "    if not platform.window.MM.UME:"
media_wait = "        while not platform.window.MM.UME:"
if html.count(media_gate) != 1 or html.count(media_wait) != 1:
    raise ValueError("Unexpected Pygbag start gate")
html = html.replace(media_gate, "    if not platform.window.academicStartRequested:")
html = html.replace(media_wait, "        while not platform.window.academicStartRequested:")
styles = "".join(f'<link rel="stylesheet" href="{name}.css">\n' for name in ("mobile", "loading"))
html = html.replace("</head>", styles + "</head>")
interface = "".join((web / filename).read_text(encoding="utf-8")
                    for filename in ("loading.html", "controls.html"))
html = html.replace("</body>", interface + "</body>")
index.write_text(html, encoding="utf-8")
for filename in ("mobile.css", "mobile.js", "loading.css", "loading.js"):
    shutil.copyfile(web / filename, output / filename)

assets = web.parent / "Academic Adventure" / "assets"
shutil.copyfile(assets / "img/interface/adlogo.png", output / "academic-logo.png")
shutil.copyfile(assets / "fonts/PixelifySansRegular.ttf", output / "PixelifySansRegular.ttf")
sounds = assets / "sounds"
shutil.copytree(sounds, output / "sounds", dirs_exist_ok=True)
