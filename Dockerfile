FROM wilburos-build-base

VOLUME [ "/database", "/packages" ]

RUN sudo pacman -Syy


# # CMD [ "/home/build/build.sh" ]
