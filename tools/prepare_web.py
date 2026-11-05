"""Stage the desktop game for a Pygbag build."""
import ast
from pathlib import Path
import re
import shutil
import subprocess
import symtable
import sys
from textwrap import indent


source = Path(__file__).resolve().parents[1] / "Academic Adventure"
destination = Path(sys.argv[1])
destination.mkdir(parents=True, exist_ok=True)
for directory in ("assets", "scripts"):
    shutil.copytree(source / directory, destination / directory, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns("__pycache__"))

web = source.parent / "web"
shutil.copyfile(web / "mobile_input.py", destination / "mobile_input.py")
for sound in (destination / "assets").rglob("*.wav"):
    subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(sound),
         str(sound.with_suffix(".ogg"))],
        check=True,
    )
    sound.unlink()

for script in (destination / "scripts").rglob("*.py"):
    original = script.read_text(encoding="utf-8")
    updated = original.replace("funcionarios/ramon/", "funcionarios/Ramon/")
    updated = updated.replace('.wav"', '.ogg"').replace(".wav'", ".ogg'")
    updated = re.sub(r"teclas\[(pygame\.K_\w+)\]", r"mobile_input.is_pressed(teclas, \1)", updated)
    if "mobile_input.is_pressed" in updated:
        updated = "import mobile_input\n" + updated
    if updated != original:
        script.write_text(updated, encoding="utf-8")

code = (source / "main.py").read_text(encoding="utf-8")
code = re.sub(r"teclas\[(pygame\.K_\w+)\]", r"mobile_input.is_pressed(teclas, \1)", code)
loop = next(node for node in ast.parse(code).body if isinstance(node, ast.While))
lines = code.splitlines(keepends=True)
# The desktop loop runs at module scope. Preserve its shared state when wrapping it.
frame = "".join(lines[loop.lineno - 1:loop.end_lineno])
state = symtable.symtable(frame, "main.py", "exec")
globals_used = sorted(symbol.get_name() for symbol in state.get_symbols()
                      if symbol.is_assigned() or symbol.is_declared_global())
frame = "".join(line for line in frame.splitlines(keepends=True)
                if not line.lstrip().startswith("global "))
frame_lines = frame.splitlines(keepends=True)
frame_lines[1:1] = [
    "    submitted_name = mobile_input.poll(cena)\n",
    "    if cena == 'naming' and submitted_name:\n",
    "        texto = submitted_name\n",
    "        pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RETURN, unicode=''))\n",
]
frame = "".join(frame_lines)
web_code = (
    "import asyncio\nimport mobile_input\n"
    + "".join(lines[:loop.lineno - 1])
    + "\nasync def run_web_game():\n"
    + "".join(f"    global {name}\n" for name in globals_used)
    + indent(frame.rstrip(), "    ")
    + "\n        await asyncio.sleep(0)\n"
    + "    pygame.quit()\n\n"
    + "asyncio.run(run_web_game())\n"
)
compile(web_code, "main.py", "exec")
(destination / "main.py").write_text(web_code, encoding="utf-8")
