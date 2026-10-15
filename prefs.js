// SPDX-License-Identifier: GPL-3.0-or-later
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GhostMovePrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();
        window.add(page);

        const general = new Adw.PreferencesGroup({title: 'Transparency'});
        page.add(general);

        const opacity = new Adw.SpinRow({
            title: 'Opacity while moving',
            subtitle: 'Percent (0 = invisible, 100 = opaque)',
            adjustment: new Gtk.Adjustment({lower: 0, upper: 100, step_increment: 5}),
        });
        settings.bind('opacity', opacity, 'value', Gio.SettingsBindFlags.DEFAULT);
        general.add(opacity);

        const resize = new Adw.SwitchRow({title: 'Also while resizing'});
        settings.bind('on-resize', resize, 'active', Gio.SettingsBindFlags.DEFAULT);
        general.add(resize);

        const borderGroup = new Adw.PreferencesGroup({title: 'Border'});
        page.add(borderGroup);

        const enabled = new Adw.SwitchRow({
            title: 'Solid border',
            subtitle: 'Keep an opaque outline around the moving window',
        });
        settings.bind('border-enabled', enabled, 'active', Gio.SettingsBindFlags.DEFAULT);
        borderGroup.add(enabled);

        const colorRow = new Adw.ActionRow({title: 'Border color'});
        const colorButton = new Gtk.ColorDialogButton({
            dialog: new Gtk.ColorDialog({with_alpha: true}),
            valign: Gtk.Align.CENTER,
        });
        const rgba = new Gdk.RGBA();
        rgba.parse(settings.get_string('border-color'));
        colorButton.rgba = rgba;
        colorButton.connect('notify::rgba', () =>
            settings.set_string('border-color', colorButton.rgba.to_string()));
        colorRow.add_suffix(colorButton);
        colorRow.activatable_widget = colorButton;
        borderGroup.add(colorRow);

        const width = new Adw.SpinRow({
            title: 'Border width',
            subtitle: 'Pixels',
            adjustment: new Gtk.Adjustment({lower: 1, upper: 20, step_increment: 1}),
        });
        settings.bind('border-width', width, 'value', Gio.SettingsBindFlags.DEFAULT);
        borderGroup.add(width);

        const rounded = new Adw.SwitchRow({title: 'Rounded corners'});
        settings.bind('border-rounded', rounded, 'active', Gio.SettingsBindFlags.DEFAULT);
        borderGroup.add(rounded);

        const radius = new Adw.SpinRow({
            title: 'Corner radius',
            subtitle: 'Pixels',
            adjustment: new Gtk.Adjustment({lower: 1, upper: 40, step_increment: 1}),
        });
        settings.bind('border-radius', radius, 'value', Gio.SettingsBindFlags.DEFAULT);
        borderGroup.add(radius);

        for (const row of [colorRow, width, rounded])
            settings.bind('border-enabled', row, 'sensitive', Gio.SettingsBindFlags.GET);
        const syncRadius = () => {
            radius.sensitive = settings.get_boolean('border-enabled') &&
                settings.get_boolean('border-rounded');
        };
        settings.connect('changed::border-enabled', syncRadius);
        settings.connect('changed::border-rounded', syncRadius);
        syncRadius();
    }
}
