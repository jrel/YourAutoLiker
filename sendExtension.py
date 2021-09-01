import os
import shutil
import string
import sys
from distutils.dir_util import copy_tree

CONST_SRC_DIR = './src'
CONST_DIST_DIR = './dist'
CONST_DIST_EXT_DIR = CONST_DIST_DIR + '/extension'

if os.path.exists(CONST_DIST_DIR):
    shutil.rmtree(CONST_DIST_DIR)
    print('Cleaning old stuff')

os.makedirs(CONST_DIST_EXT_DIR)
copy_tree(CONST_SRC_DIR, CONST_DIST_EXT_DIR)

print('Copying the extension folder')


def inplace_change(filename, old_string, new_string):
    # Safely read the input filename using 'with'
    with open(filename) as f:
        s = f.read()
        if old_string not in s:
            print('No ocurrences on {filename}.'.format(**locals()))
            return

    # Safely write the changed content, if found in the file
    with open(filename, 'w') as f:
        print(
            'Replaced in {filename}'.format(**locals()))
        s = s.replace(old_string, new_string)
        f.write(s)


for root, dirs, files in os.walk(CONST_DIST_EXT_DIR):
    for file in files:
        if file.endswith('.js'):
            inplace_change(os.path.join(root, file),
                           'console.log', '//console.log')

shutil.make_archive('./dist/extension', 'zip', CONST_DIST_EXT_DIR)
print('creating zip file')
