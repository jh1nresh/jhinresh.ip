#!/usr/bin/env python3
"""Small deterministic integrity check for the static portfolio."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import sys

ROOT = Path(__file__).resolve().parents[1]


class PortfolioParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.local_assets: list[str] = []
        self.external_links: list[tuple[str, str | None]] = []
        self.images_without_alt = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if element_id := values.get("id"):
            self.ids.append(element_id)
        if tag == "img":
            if not values.get("alt"):
                self.images_without_alt += 1
            if src := values.get("src"):
                self._record_asset(src)
        if tag == "link" and (href := values.get("href")):
            self._record_asset(href)
        if tag == "script" and (src := values.get("src")):
            self._record_asset(src)
        if tag == "a" and (href := values.get("href")):
            if href.startswith(("http://", "https://")):
                self.external_links.append((href, values.get("rel")))
            elif not href.startswith(("#", "mailto:", "data:")):
                self._record_asset(href)

    def _record_asset(self, value: str) -> None:
        parsed = urlparse(value)
        if parsed.scheme or value.startswith("data:"):
            return
        self.local_assets.append(parsed.path)


def main() -> int:
    html_path = ROOT / "index.html"
    parser = PortfolioParser()
    parser.feed(html_path.read_text(encoding="utf-8"))

    errors: list[str] = []
    duplicate_ids = sorted({value for value in parser.ids if parser.ids.count(value) > 1})
    if duplicate_ids:
        errors.append(f"duplicate IDs: {', '.join(duplicate_ids)}")

    for asset in sorted(set(parser.local_assets)):
        resolved = (ROOT / asset).resolve()
        if not resolved.is_relative_to(ROOT.resolve()) or not resolved.exists():
            errors.append(f"missing local asset: {asset}")

    if parser.images_without_alt:
        errors.append(f"images without alt text: {parser.images_without_alt}")

    unsafe_external = [href for href, rel in parser.external_links if "noreferrer" not in (rel or "")]
    if unsafe_external:
        errors.append("external links missing rel=noreferrer: " + ", ".join(unsafe_external))

    required_sections = {"top", "work", "index", "research", "contact"}
    missing_sections = required_sections.difference(parser.ids)
    if missing_sections:
        errors.append("missing sections: " + ", ".join(sorted(missing_sections)))

    if errors:
        print("Portfolio validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "Portfolio validation passed: "
        f"{len(parser.ids)} IDs, {len(set(parser.local_assets))} local assets, "
        f"{len(parser.external_links)} external links."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
