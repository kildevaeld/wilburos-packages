#!/bin/bash

sudo pacman -Syu --noconfirm

SOURCE_DIR=${PWD}/src
DATA_DIR=/data
PACKAGE_DIR=/packages

PACKAGES=$(ls ${PACKAGE_DIR})



check_version() {
    local path="$1/PKGBUILD"

    local version=$(awk -F "=" '/pkgver/ {print $2; ext}' "$path")
    local name=$(awk -F "=" '/pkgname/ {print $2; exit}' "$path")
    local name=$(echo $name | tr -d '"')
    local pkgrel=$(awk -F "=" '/pkgrel/ {print $2; exit}' "$path")
    # local arch=$(awk -F "=" '/arch/ {print $2}' "$path")
    # arch=$(echo $arch | tr -d '()' | tr -d "'")
    local file_any_name="${name}-${version}-${pkgrel}-any.pkg.tar.zst"
    local file_x86_name="${name}-${version}-${pkgrel}-x86_64.pkg.tar.zst"



    if [ -f "${DATA_DIR}/${file_any_name}" ] || [ -f "${DATA_DIR}/${file_x86_name}" ]; then
        echo true
    else
        echo false
    fi
}


mkdir -p ${SOURCE_DIR}

for PACKAGE in ${PACKAGES}; do

    found=$(check_version "${PACKAGE_DIR}/${PACKAGE}")
    if [ "$found" = true ]; then
        echo "Package already exists for ${PACKAGE}"
        continue
    fi

    cp -r ${PACKAGE_DIR}/${PACKAGE} ${SOURCE_DIR}

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
    repo-add -n -p wilburos.db.tar.gz ${PACKAGE}
done

rm -f *.old
