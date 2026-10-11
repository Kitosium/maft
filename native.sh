#!/bin/sh
# Workaround for FUSE workspace restrictions (noexec+nodlopen, no symlinks).
# Bind-mounts node_modules to an executable f2fs dir (/root/.maft-nm) so native
# addons and binaries can run.
# Idempotent: Run before any npm/node tasks, and re-run if directories are renamed.
set -e
NM=/root/.maft-nm
bind_one() {
  d="$1"
  t="$NM/$(echo "$d" | tr / _)"
  mkdir -p "$t" "$d"
  if ! mountpoint -q "$d"; then
    mount --bind "$t" "$d"
  fi
}
bind_one /root/workspace/maft/node_modules
bind_one /root/workspace/maft/backend/node_modules
bind_one /root/workspace/maft/frontend/node_modules
exit 0
