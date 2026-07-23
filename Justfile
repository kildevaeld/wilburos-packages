
default:
    @just -l

clean:
    #/bin/bash
    rm -rf x86_64/*

build:
    docker run --rm -v $(pwd)/x86_64:/data -v $(pwd)/src:/packages wilburos-packages "./build.sh"

build-aur: build-image
    docker run --rm -v $(pwd)/x86_64:/database wilburos-packages wilburos-build -a -w /home/build/tmp -d /database/wilburos.db.tar.gz theme.sh

build-image:
    docker build -t wilburos-packages .


build-build-image:
    docker build -f Docker.base -t wilburos-build-base .
