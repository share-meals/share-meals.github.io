"""
Generates the QR codes printed in the "Get the app" band of the /app
one-pager, one per route to the app, into public/qr/. Commit the output.

    pip install segno   # in any throwaway venv; not a project dependency
    python3 scripts/build-qr.py

WHY QR CODES. Store links are useless on paper and nobody retypes an App
Store URL, so the printed sheet gives the reader something to scan instead.

WHY COMMITTED. The targets are fixed URLs, so the codes only change when a
URL does. Generating them once keeps a QR library out of the build.

Dark modules are the brand green (#106535, 7.16:1 on white): well inside
what phone scanners read, and the light background is the white tile the
band places them on. Error correction M survives print smudges at the size
they are printed.
"""

import re

import segno

CODES = {
    'app-store': 'https://apps.apple.com/us/app/share-meals/id1227449725',
    'google-play': 'https://play.google.com/store/apps/details?id=org.sharemeals.app',
    'web': 'https://app.sharemeals.org',
}

for name, url in CODES.items():
    path = f'public/qr/{name}.svg'
    segno.make(url, error='m').save(
        path, kind='svg', dark='#106535', light='#ffffff', border=2,
        xmldecl=False, svgns=True,
    )
    # segno writes a fixed width/height and no viewBox, so the code would
    # clip rather than scale at the printed size. Swap one for the other and
    # let the page size it.
    with open(path) as f:
        svg = f.read()
    svg = re.sub(r'width="(\d+)" height="(\d+)"',
                 r'viewBox="0 0 \1 \2" shape-rendering="crispEdges"', svg, count=1)
    with open(path, 'w') as f:
        f.write(svg)
    print(f'  {path}  <-  {url}')
