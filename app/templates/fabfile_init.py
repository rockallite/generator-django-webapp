# -*- coding: utf-8 -*-
"""Fabric task definitions."""

import os

from fabric.api import *

from .utils import ensure_local

DEFAULT_DJANGO_SETTINGS_MODULE = '<%= projectName %>.spec.local.settings'
ROOT_PATH = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
APPS_PATH = os.path.join(ROOT_PATH, 'apps')


@task
def startapp(name, dsm=DEFAULT_DJANGO_SETTINGS_MODULE, dest=APPS_PATH):
    """[Local] Start a new Django app in `apps` folder"""
    ensure_local()
    full_dest = os.path.normpath(os.path.join(dest, name))
    if not os.path.exists(full_dest):
        puts('Creating `%s` directory ...' % full_dest)
        os.makedirs(full_dest)
    with lcd(ROOT_PATH):
        local('./manage.py startapp %s %s --settings=%s' % (name, full_dest, dsm))
