// SPDX-License-Identifier: GPL-3.0-or-later
import Meta from 'gi://Meta';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const FADE_MS = 100;

const MOVE_OPS = [
    Meta.GrabOp.MOVING,
    Meta.GrabOp.MOVING_UNCONSTRAINED,
    Meta.GrabOp.KEYBOARD_MOVING,
];

function opKind(op) {
    if (MOVE_OPS.includes(op))
        return 'move';
    // Any other window grab (mouse or keyboard, any edge) is a resize.
    return op & Meta.GrabOp.WINDOW_BASE ? 'resize' : null;
}

export default class GhostMoveExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._active = null;
        const display = global.display;
        this._beginId = display.connect('grab-op-begin',
            (_d, window, op) => this._begin(window, op));
        this._endId = display.connect('grab-op-end',
            (_d, window) => this._end(window));
    }

    disable() {
        global.display.disconnect(this._beginId);
        global.display.disconnect(this._endId);
        this._restore(false);
        this._settings = null;
    }

    _begin(window, op) {
        const kind = opKind(op);
        if (!window || !kind)
            return;
        if (kind === 'resize' && !this._settings.get_boolean('on-resize'))
            return;
        const actor = window.get_compositor_private();
        if (!actor)
            return;

        this._restore(false);
        const a = {window, actor, signals: []};
        this._active = a;

        actor.remove_transition('opacity');
        actor.ease({
            opacity: Math.round(this._settings.get_int('opacity') * 2.55),
            duration: FADE_MS,
        });
        a.signals.push([actor, actor.connect('destroy', () => {
            a.destroyed = true;
            this._restore(false);
        })]);

        if (this._settings.get_boolean('border-enabled')) {
            const w = this._settings.get_int('border-width');
            const color = this._settings.get_string('border-color');
            const radius = this._settings.get_boolean('border-rounded')
                ? this._settings.get_int('border-radius') : 0;
            a.border = new St.Widget({
                style: `border: ${w}px solid ${color}; border-radius: ${radius}px;`,
                reactive: false,
            });
            a.borderWidth = w;
            const parent = actor.get_parent();
            parent.add_child(a.border);
            parent.set_child_above_sibling(a.border, actor);
            this._syncBorder();
            a.signals.push([window, window.connect('position-changed', () => this._syncBorder())]);
            a.signals.push([window, window.connect('size-changed', () => this._syncBorder())]);
        }
    }

    _syncBorder() {
        const a = this._active;
        if (!a?.border)
            return;
        const r = a.window.get_frame_rect();
        const w = a.borderWidth;
        a.border.set_position(r.x - w, r.y - w);
        a.border.set_size(r.width + 2 * w, r.height + 2 * w);
    }

    _end(window) {
        if (this._active && this._active.window === window)
            this._restore(true);
    }

    _restore(animate) {
        const a = this._active;
        if (!a)
            return;
        this._active = null;
        for (const [obj, id] of a.signals)
            obj.disconnect(id);
        a.border?.destroy();
        if (!a.destroyed) {
            a.actor.remove_transition('opacity');
            if (animate)
                a.actor.ease({opacity: 255, duration: FADE_MS});
            else
                a.actor.opacity = 255;
        }
    }
}
