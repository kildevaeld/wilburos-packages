aur-package := `cat aur-packages | tr '\n' ' '`

default:
    @just -l

clean:
    #/bin/bash
    rm -rf x86_64/*

build:
    docker run --rm -v $(pwd)/x86_64:/database -v $(pwd)/src:/packages wilburos-packages wilburos-build -w /home/build/tmp -d /database/wilburos.db.tar.gz /packages/wilburos-hyprland

build-aur: build-image
    docker run --rm -v $(pwd)/x86_64:/database wilburos-packages wilburos-build -a -w /home/build/tmp -d /database/wilburos.db.tar.gz {{aur-package}}

build-image:
    docker build -t wilburos-packages .


build-build-image:
    docker build -f Docker.base -t wilburos-build-base .
