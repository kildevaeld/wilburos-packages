FROM wilburos-build-base

VOLUME [ "/database", "/packages" ]

COPY pacman.conf /etc/pacman.conf


RUN sudo pacman -Syy

COPY entry.sh /usr/bin/entry.sh
RUN sudo chmod +x /usr/bin/entry.sh

ENTRYPOINT [ "entry.sh" ]

# # CMD [ "/home/build/build.sh" ]
