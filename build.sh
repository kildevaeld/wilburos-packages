#!/bin/bash

sudo pacman -Syu --noconfirm

SOURCE_DIR=${PWD}/src
DATA_DIR=/data

PACKAGES=$(ls ${SOURCE_DIR})

AUR_PACKAGES=$(cat ./aur-packages)

# for AUR in ${AUR_PACKAGES}; do
#     echo "Building AUR package: ${AUR}"
#     cd ${SOURCE_DIR}
#     git clone https://aur.archlinux.org/${AUR}.git
#     cd ${SOURCE_DIR}/${AUR}
#     paru -U --noconfirm
#     mv *.pkg.tar.zst ${DATA_DIR}/
#     # mv *.pkg.tar.zst.sig ${DATA_DIR}/
#     makepkg --clean
# done

for PACKAGE in ${PACKAGES}; do
    echo "Building package: ${PACKAGE}"
    cd ${SOURCE_DIR}/${PACKAGE}
    paru -U --noconfirm
    mv *.pkg.tar.zst ${DATA_DIR}/
    # mv *.pkg.tar.zst.sig ${DATA_DIR}/
    makepkg --clean
done

cd ${DATA_DIR}
for PACKAGE in *.pkg.tar.zst; do
    # echo "Signing package: ${PACKAGE}"
    # gpg --detach-sign --armor ${PACKAGE}
    repo-add wilburos.db.tar.gz ${PACKAGE}
done

rm *.old