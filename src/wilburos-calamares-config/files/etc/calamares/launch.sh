#!/usr/bin/bash
#
# Launches the Calamares installer on the WilburOS live session.

DIR="/etc/calamares"
KERNEL="$(uname -r)"

# If the live medium was booted with "copytoram", the source paths in
# unpackfs.conf need to point at the RAM copy instead of the boot medium.
if [[ -d "/run/archiso/copytoram" ]]; then
    sudo sed -i -e 's|/run/archiso/bootmnt/arch/x86_64/airootfs.sfs|/run/archiso/copytoram/airootfs.sfs|g' "$DIR"/modules/unpackfs.conf
    sudo sed -i -e "s|/run/archiso/bootmnt/arch/boot/x86_64/vmlinuz-linux|/usr/lib/modules/$KERNEL/vmlinuz|g" "$DIR"/modules/unpackfs.conf
fi

if [[ "$XDG_SESSION_TYPE" == "wayland" ]]; then
    sudo -E calamares -d
else
    pkexec calamares -d
fi
