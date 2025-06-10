# .devcontainer/Dockerfile

# Node.js 22 の公式イメージをベースにする (bookworm-slim)
FROM node:22-bookworm-slim

# 必要なパッケージをインストール（Git/SSH関連を強化）
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        openssh-client \
        curl \
        ca-certificates \
        keychain \
        locales \
        sudo && \
    localedef -i ja_JP -c -f UTF-8 -A /usr/share/locale/locale.alias ja_JP.UTF-8 && \
    rm -rf /var/lib/apt/lists/*

ENV LANG=ja_JP.UTF-8 \
    LANGUAGE=ja_JP:ja \
    LC_ALL=ja_JP.UTF-8

# ╭─ シェル起動時に keychain を自動実行 ─╮
# │ id_rsa → 必要に応じ別キーへ書き換え │
# ╰──────────────────────╯
RUN echo 'eval $(keychain --eval --agents ssh id_rsa)' >> /etc/profile.d/keychain.sh

# ======== pnpm をインストールするための変更箇所 ========
# corepack を有効化 (Node.js v16.13 以降で利用可能)
RUN corepack enable
# 最新版の pnpm を準備して有効化
RUN corepack prepare pnpm@latest --activate
# ================================================

# ======== Task (Taskfile) をインストール ========
RUN sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin
# ================================================

# nodeユーザーでSSHディレクトリを作成し、権限を設定
RUN mkdir -p /home/node/.ssh && \
    chown -R node:node /home/node/.ssh && \
    chmod 700 /home/node/.ssh

# nodeユーザーにsudo権限を付与（パスワードなし）
RUN echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

WORKDIR /app
EXPOSE 3000

# Git設定のデフォルト値を設定 (必要に応じて変更)
RUN git config --global init.defaultBranch main
RUN git config --global core.autocrlf input

# nodeユーザーに切り替え
USER node
