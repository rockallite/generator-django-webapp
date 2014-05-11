# -*- coding: utf-8 -*-
from fabric.state import env
from fabric.utils import abort


def ensure_local():
    if env.host_string is not None:
        abort('This is a local task. No host/role should be specified.')
