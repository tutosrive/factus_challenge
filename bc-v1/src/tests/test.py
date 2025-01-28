import os

a = os.access('./src/test/', 0)

if not a:
    os.mkdir('./src/tests2')

print(a)