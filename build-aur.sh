#!/bin/bash


SOURCE_DIR=${PWD}/aur
DATA_DIR=/data

mkdir -p ${SOURCE_DIR}


PACKAGES=$(ls ${SOURCE_DIR})
AUR_PACKAGES=$(cat ./aur-packages)


check_version() {
    local path="$1/PKGBUILD"

    local version=$(awk -F "=" '/pkgver/ {print $2; exit}' $path)
    local name=$(awk -F "=" '/pkgname/ {print $2; exit}' $path)
    local name=$(echo $name | tr -d '"')
    local pkgrel=$(awk -F "=" '/pkgrel/ {print $2; exit}' $path)
    # local arch=$(awk -F "=" '/arch/ {print $2}' $path)
    # arch=$(echo $arch | tr -d '()' | tr -d "'")
    local file_any_name="${name}-${version}-${pkgrel}-any.pkg.tar.zst"
    local file_x86_name="${name}-${version}-${pkgrel}-x86_64.pkg.tar.zst"

    if [ -f "${DATA_DIR}/${file_any_name}" ] || [ -f "${DATA_DIR}/${file_x86_name}" ]; then
        echo true
    else
        echo false
    fi
}



for AUR in ${AUR_PACKAGES}; do
    source_dir="${SOURCE_DIR}/${AUR}"

    echo "Building AUR package: ${AUR}"
    git clone https://aur.archlinux.org/${AUR}.git $source_dir


    found=$(check_version $source_dir)
    if [ "$found" = true ]; then
        echo "Package already exists for ${AUR}"
        continue
    fi

    cd $source_dir
    paru -U --noconfirm
    mv *.pkg.tar.zst ${DATA_DIR}/
    # # mv *.pkg.tar.zst.sig ${DATA_DIR}/
    # makepkg --clean
done


cd ${DATA_DIR}
for PACKAGE in *.pkg.tar.zst; do
    repo-add -n -p wilburos.db.tar.gz ${PACKAGE}
done

rm -f *.old
