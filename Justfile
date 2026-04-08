
default:
    @just -l

clean:
    #/bin/bash
    rm -rf x86_64/*

build:
    docker build -t wilburos-packages .
    docker run --rm -v $(pwd)/x86_64:/data wilburos-packages