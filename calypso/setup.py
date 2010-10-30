#!/usr/bin/env python

from distutils.core import setup

setup(name='Distutils',
      version='1.0',
      description='Python Distribution Utilities',
      author='Greg Ward',
      author_email='gward@python.net',
      url='http://www.python.org/sigs/distutils-sig/',
      packages=['distutils', 'distutils.command'],
      install_requires=[
          "Pylons>=0.9.7",
          "SQLAlchemy>=0.5,<=0.5.99",
          "Mako",
          "FormBuild>=2.0,<2.99",
          ],
     )

