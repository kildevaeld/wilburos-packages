
SOURCE_DIR=${PWD}/aur
DATA_DIR=${PWD}/x86_64

PACKAGES=$(ls ${SOURCE_DIR})
AUR_PACKAGES=$(cat ./aur-packages)

check_version() {
    local path="$1/PKGBUILD"

    local version=$(awk -F "=" '/pkgver/ {print $2; exit}' "$path")
    local name=$(awk -F "=" '/pkgname/ {print $2; exit}' $path)
    local name=$(echo $name | tr -d '"')
    local pkgrel=$(awk -F "=" '/pkgrel/ {print $2; exit}' $path)
    # local arch=$(awk -F "=" '/arch/ {print $2}' $path)
    # arch=$(echo $arch | tr -d '()' | tr -d "'")
    local file_any_name="${name}-${version}-${pkgrel}-any.pkg.tar.zst"
    local file_x86_name="${name}-${version}-${pkgrel}-x86_64.pkg.tar.zst"

    echo $version
    # echo $file_x86_name
    # echo "${DATA_DIR}/${file_any_name}"

    if [ -f "${DATA_DIR}/${file_any_name}" ] || [ -f "${DATA_DIR}/${file_x86_name}" ]; then
        echo true
    else
        echo false
    fi
}


check_version ${SOURCE_DIR}/paru
