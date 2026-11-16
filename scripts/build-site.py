#!/usr/bin/env python3
"""Stage the current page's local dependencies and required attribution for Pages."""
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'
REFERENCE = re.compile(r'(?<![\w/-])(?:\./)?assets/[\w./-]+\.[\w]+')
ATTRIBUTION = {
    'assets/books/SOURCES.md', 'assets/projects/previews/SOURCES.md',
    'assets/reference/LICENSE.adityaojha.txt', 'assets/reference/NOTICE.md',
    'assets/icons/LICENSE.txt', 'assets/stack-icons/LICENSE.simple-icons.txt',
    'assets/stack-icons/NOTICE.md', 'assets/fonts/Caveat-OFL.txt',
    'assets/fonts/DM-Sans-OFL.txt', 'assets/fonts/Instrument-Serif-OFL.txt',
    'assets/bookshelf/LICENSE', 'assets/bookshelf/THIRD_PARTY_NOTICES.txt',
    'assets/bookshelf/bookshelf.js.LEGAL.txt',
}


def main() -> None:
    if OUT.exists():
        raise SystemExit('_site already exists; use a fresh checkout for packaging.')
    pending = {'index.html', 'styles.css', 'script.js', 'site-data.json'} | ATTRIBUTION
    files: set[str] = set()
    while pending:
        name = pending.pop().removeprefix('./')
        if name in files:
            continue
        source = (ROOT / name).resolve()
        if not source.is_relative_to(ROOT) or not source.is_file():
            raise SystemExit(f'Missing or unsafe site dependency: {name}')
        files.add(name)
        if source.suffix in {'.html', '.css', '.js', '.json'}:
            pending.update(match.removeprefix('./') for match in REFERENCE.findall(source.read_text()))
    # Discover everything before writing so missing assets cannot yield a partial artifact.
    for name in sorted(files):
        target = OUT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / name, target)
    (OUT / '.nojekyll').touch()
    print(f'Pages artifact ready: {len(files)} files, {sum((OUT / name).stat().st_size for name in files):,} bytes')


if __name__ == '__main__':
    main()
