-- See https://wiki.hypr.land/Configuring/Basics/Autostart/

-- Autostart necessary processes (like notifications daemons, status bars, etc.)
-- Or execute your favorite apps at launch like this:

local config = require 'config'

hl.on("hyprland.start", function()
    hl.exec_cmd(config.terminal)
    hl.exec_cmd("nm-applet")
    hl.exec_cmd("waybar & hyprpaper")
    hl.exec_cmd("wl-paste --watch clipvault store")
    hl.exec_cmd('hypridle')
    hl.exec_cmd("systemctl --user start hyprpolkitagent")
end)
