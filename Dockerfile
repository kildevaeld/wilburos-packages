FROM archlinux:base-devel

# makepkg cannot (and should not) be run as root:
RUN useradd -m build && \
    pacman -Syu --noconfirm && \
    pacman -Sy --noconfirm git && \
    # Allow build to run stuff as root (to install dependencies):
    echo "build ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/build

# Continue execution (and CMD) as build:
USER build
WORKDIR /home/build

# Auto-fetch GPG keys (for checking signatures):
RUN mkdir .gnupg && \
    touch .gnupg/gpg.conf && \
    echo "keyserver-options auto-key-retrieve" > .gnupg/gpg.conf && \
    git clone https://aur.archlinux.org/paru.git && \
    cd paru && \
    makepkg --noconfirm --syncdeps --rmdeps --install --clean




COPY src /home/build/src
COPY build.sh /home/build

USER root

RUN chmod +x /home/build/build.sh
RUN chown -R build:build /home/build

USER build

VOLUME [ "/data" ]

CMD [ "/home/build/build.sh" ]

