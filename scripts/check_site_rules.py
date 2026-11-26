#!/usr/bin/env python3
"""House-rule checks for Elghaly product-site HTML (stdlib only).

Also enforced on every full page: the exact company address in the footer,
and no banned word in visible text or in the copy the scripts write:
free/مجان/бесплатн/免费, safe/safety/آمن/безопасн/安全, only/فقط/только/仅/只,
%, AI, ذكاء اصطناعي."""
import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent

FOOTER_URLS = []  # product sites keep their own footer links

FOOTER_BLOCK = re.compile(r"<footer\b[^>]*>(.*?)</footer>", re.I | re.S)

FORBIDDEN_WORDS = re.compile(r"\b(live|profit|guarantee|audit|launched)\b", re.I)
FORBIDDEN = [
    (re.compile(r"qq\.com", re.I), "qq.com"),
    (re.compile(r"telegram", re.I), "Telegram"),
    (re.compile(r"t\.me/", re.I), "t.me link"),
    (re.compile(r"facebook\.com", re.I), "Facebook"),
]

# Public company address: this exact string, in the footer of every full page.
ADDRESS = "Elghaly LLC, 548 Market St, San Francisco, CA 94104, USA"

# Banned in visible copy (owner rule; the assistant is named «الغالي», never "AI").
# Latin words use word boundaries; Arabic, Russian stems and Chinese match as
# substrings (CJK has no word boundaries), and so does "%".
BANNED = re.compile(
    r"\b(free|safe|safety|only|AI)\b"
    r"|(مجان|فقط|آمن|ذكاء اصطناعي|бесплатн|только|безопасн|免费|仅|只|安全|%)",
    re.I,
)
# Hits already on main when this check was added (page -> word -> count).
# The check fails on any hit above these numbers, so nothing new gets in.
# Remove entries as the copy is fixed.
MENU_BASELINE = set()  # page-menu labels allowed to carry a banned word (none)
FOOTER_ENFORCED = False  # flip to True once the footer PRs (plain name + address) are merged
BANNED_BASELINE = {}

SKIP = {".git", ".github", "tools", "fonts", "assets"}
EXEMPT_FRAGMENTS = (
    "media/shopify/",
    "tools/site-kit/head.html",
)


class _VisibleStrip(HTMLParser):
    __slots__ = ("_skip", "out")

    def __init__(self) -> None:
        super().__init__()
        self._skip = 0
        self.out: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag.lower() in ("script", "style"):
            self._skip += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in ("script", "style") and self._skip:
            self._skip -= 1

    def handle_data(self, data: str) -> None:
        if not self._skip:
            self.out.append(data)


def visible_text(raw: str) -> str:
    raw = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
    parser = _VisibleStrip()
    parser.feed(raw)
    parser.close()
    return re.sub(r"\s+", " ", " ".join(parser.out))


def is_redirect(raw: str) -> bool:
    head = raw.split("</head>", 1)[0] if re.search(r"</head>", raw, re.I) else raw[:4000]
    return bool(re.search(r'<meta[^>]+http-equiv=["\']refresh["\']', head, re.I))


def is_exempt(path: pathlib.Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    for pref in EXEMPT_FRAGMENTS:
        if rel.startswith(pref) or rel == pref:
            return True
    return False


def is_full_page(path: pathlib.Path, raw: str) -> bool:
    if is_exempt(path):
        return False
    if not re.search(r"<!DOCTYPE\s+html|<html\b", raw, re.I):
        return False
    if is_redirect(raw):
        return False
    return True


def footer_has_name(raw: str) -> bool:
    """Footer carries the plain name; LLC is not formed yet, so it must not appear."""
    block = FOOTER_BLOCK.search(raw)
    if block:
        return "<p>elghaly</p>" in block.group(1) and "elghaly, LLC" not in block.group(1)
    return False


def address_and_banned(rel: str, raw: str) -> list:
    """Exact company address in the footer; banned words not above the baseline."""
    errs = []
    block = FOOTER_BLOCK.search(raw)
    if FOOTER_ENFORCED and (not block or ADDRESS not in visible_text(block.group(1))):
        errs.append("%s: footer must carry the address exactly: %s" % (rel, ADDRESS))
    counts = {}
    # Text people see outside the body copy too: meta descriptions and titles
    # (search results, link previews), alt, title, aria-label, placeholder.
    attrs = " ".join(
        (m.group(1) or m.group(2) or "")
        for m in re.finditer(
            r'<meta\b[^>]*\bcontent="([^"]*)"|\b(?:alt|title|aria-label|placeholder)="([^"]*)"', raw
        )
    )
    for m in BANNED.finditer(visible_text(raw) + " " + attrs):
        w = (m.group(1) or m.group(2)).lower()
        counts[w] = counts.get(w, 0) + 1
    allowed = BANNED_BASELINE.get(rel, {})
    for w, n in sorted(counts.items()):
        if n > allowed.get(w, 0):
            errs.append("%s: banned word %r in visible text (%d, baseline %d)" % (rel, w, n, allowed.get(w, 0)))
    return errs


def html_pages():
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP for part in path.parts):
            continue
        if "site-kit" in path.parts and path.name == "head.html":
            continue
        yield path


# Copy the scripts write into the page: every key:"value" in the language
# tables, and the English fallbacks passed to tt()/tr().
COPY_FILES = ("i18n.js", "boot.js")
FALLBACK_FILES = ("ui.js", "app.js")
# Real phone menu names (Android/Google settings), quoted as the phone shows them.
COPY_ALLOWED = {
    "Настройки → Google → Безопасность → Устройства",
    "Настройки → Безопасность → Админы",
    "设置 → Google → 安全 → 设备",
    "设置 → 安全 → 设备管理应用",
}
_KV = re.compile(r'\b(\w+):"((?:[^"\\]|\\.)*)"')
_FALLBACK = re.compile(r'\b(?:tt|tr)\(\s*"(\w+)"\s*,\s*"((?:[^"\\]|\\.)*)"')


def copy_strings() -> list:
    errs = []
    for name, pat in [(f, _KV) for f in COPY_FILES] + [(f, _FALLBACK) for f in FALLBACK_FILES]:
        path = ROOT / name
        if not path.exists():
            continue
        for key, val in pat.findall(path.read_text(encoding="utf-8")):
            m = BANNED.search(val)
            if m and val not in COPY_ALLOWED:
                errs.append("%s: banned word %r in %s: %r" % (name, m.group(0), key, val[:80]))
    return errs


def main():
    errors = []
    index = ROOT / "index.html"
    if index.exists():
        text = index.read_text(encoding="utf-8")
        for url in FOOTER_URLS:
            if url not in text:
                errors.append("index.html missing footer link %s" % url)
        vis = visible_text(text)
        for pat, label in FORBIDDEN:
            if pat.search(vis):
                errors.append("index.html: forbidden %s" % label)
        for match in FORBIDDEN_WORDS.finditer(vis):
            errors.append("index.html: forbidden word %r" % match.group(0))

    for path in html_pages():
        rel = path.relative_to(ROOT)
        raw = path.read_text(encoding="utf-8")
        if FOOTER_ENFORCED and is_full_page(path, raw) and not footer_has_name(raw):
            errors.append("%s: footer must read plain elghaly (no LLC)" % rel)
        if is_full_page(path, raw):
            errors.extend(address_and_banned(rel.as_posix(), raw))
        if path.name == "index.html" and path.parent == ROOT:
            continue
        if rel.parts[0] in ("ar", "ru", "zh") and len(rel.parts) == 2 and rel.name == "index.html":
            continue
        vis = visible_text(raw)
        for pat, label in FORBIDDEN:
            if pat.search(vis):
                errors.append("%s: forbidden %s" % (rel, label))

    # Labels the page menu script writes into the page.
    menu = ROOT / "page-menu.js"
    if menu.exists():
        for lit in re.findall(r'"([^"\n]*)"', menu.read_text(encoding="utf-8")):
            if re.search(r"[\w-]+:[^;\s][^;]*;", lit):
                continue  # a line of CSS, not a label
            m = BANNED.search(lit)
            if m and lit not in MENU_BASELINE:
                errors.append("page-menu.js: banned word %r in %r" % (m.group(0), lit))

    errors.extend(copy_strings())

    for msg in errors:
        print("FAIL", msg)
    if errors:
        sys.exit(1)
    print("ok: elghaly.dev house rules")


if __name__ == "__main__":
    main()
