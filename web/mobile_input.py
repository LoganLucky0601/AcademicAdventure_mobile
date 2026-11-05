"""Translate browser touch controls into the game's Pygame input."""
import json
import sys

import pygame

KEYS = {
    "up": pygame.K_UP,
    "down": pygame.K_DOWN,
    "left": pygame.K_LEFT,
    "right": pygame.K_RIGHT,
    "enter": pygame.K_RETURN,
    "pause": pygame.K_p,
    "escape": pygame.K_ESCAPE,
}
held_keys = set()


def poll(scene):
    if sys.platform != "emscripten":
        return None

    from platform import window

    frame = json.loads(str(window.academicMobileFrame(scene)))
    held_keys.clear()
    held_keys.update(KEYS[key] for key in frame["held"])
    for key in frame["presses"]:
        held_keys.add(KEYS[key])
        pygame.event.post(pygame.event.Event(pygame.KEYDOWN, key=KEYS[key], unicode=""))
    return frame["name"]


def is_pressed(keyboard, key):
    return keyboard[key] or key in held_keys
