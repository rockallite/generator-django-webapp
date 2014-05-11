# -*- coding: utf-8 -*-
"""Fabric task definitions."""

import os

from fabric.api import *

from .utils import ensure_local

DEFAULT_DJANGO_SETTINGS_MODULE = '<%= projectName %>.spec.local.settings'
APPS_PATH = 'apps'  # Use forward slashes, even on windows!


@task
def startapp(name, dsm=DEFAULT_DJANGO_SETTINGS_MODULE, dest=APPS_PATH):
    """[Local] Start a new Django app in `apps` folder"""
    ensure_local()
    full_dest = os.path.normpath(os.path.join(dest, name))
    if not os.path.exists(full_dest):
        puts('Creating `%s` directory ...' % full_dest)
        os.makedirs(full_dest)
    local('./manage.py startapp %s %s --settings=%s' % (name, full_dest, dsm))
