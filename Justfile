
default:
    @just -l

clean:
    #/bin/bash
    rm -rf x86_64/*

build:
    docker run --rm -v $(pwd)/x86_64:/data wilburos-packages "./build.sh"

build-aur:
    docker run --rm -v $(pwd)/x86_64:/data wilburos-packages "./build-aur.sh"

build-image:
    docker build -t wilburos-packages .
