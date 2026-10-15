# Ghost Move

A small GNOME Shell extension that makes windows transparent while you move them,
so you can see what's underneath. You can also have a solid border stay around the window while you drag it.

Supports GNOME Shell 50 and 51.

## Features

- Windows fade to a configurable opacity while being moved (mouse drag or keyboard move)
  and fade back when released.
- Optional opaque border around the moving window, drawn as a separate layer so it
  stays solid while the window is transparent:
  - any color (with alpha)
  - adjustable width
  - optional rounded corners with adjustable radius
- Optionally applies while resizing too.

## Installation

```sh
git clone https://github.com/Etienne-GN/ghost-move.git ~/.local/share/gnome-shell/extensions/ghost-move@etienne-gn.github.io
glib-compile-schemas ~/.local/share/gnome-shell/extensions/ghost-move@etienne-gn.github.io/schemas
```

Then log out and back in (GNOME on Wayland only discovers new extensions at login),
and enable it:

```sh
gnome-extensions enable ghost-move@etienne-gn.github.io
```

The clone directory **must** be named after the UUID shown above.

## Configuration

```sh
gnome-extensions prefs ghost-move@etienne-gn.github.io
```

| Setting                | Key              | Default              |
|------------------------|------------------|----------------------|
| Opacity while moving   | `opacity`        | `60` (%)             |
| Also while resizing    | `on-resize`      | `false`              |
| Solid border           | `border-enabled` | `false`              |
| Border color           | `border-color`   | `rgba(53,132,228,1)` |
| Border width           | `border-width`   | `2` (px)             |
| Rounded corners        | `border-rounded` | `false`              |
| Corner radius          | `border-radius`  | `12` (px)            |

Settings take effect the next time you start moving a window. You can also set them from the command line:

```sh
gsettings --schemadir ~/.local/share/gnome-shell/extensions/ghost-move@etienne-gn.github.io/schemas \
  set org.gnome.shell.extensions.ghost-move opacity 50
```

## How it works

The extension listens to `grab-op-begin` / `grab-op-end` on `global.display`, and
checks the `Meta.GrabOp` to tell moves from resizes. While the grab lasts, it eases
the window actor's opacity. The border is an `St.Widget` placed directly above the
window actor in the window group. It follows the window's frame rect through
`position-changed` and `size-changed`.

## Troubleshooting

```sh
journalctl --user -b | grep -i ghost
```

## Why not "Transparent Window Moving"?

[Transparent Window Moving](https://extensions.gnome.org/extension/1446/transparent-window-moving/)
only supports GNOME Shell up to 50. In 51, `grab-op-begin` gained an extra argument.
Ghost Move is a small rewrite for current GNOME that adds the border options.

## License

GPL-3.0-or-later
