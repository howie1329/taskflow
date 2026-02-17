#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


DEFAULT_IGNORE_DIRS = {
  ".git",
  ".clerk",
  ".next",
  ".turbo",
  ".cache",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  ".vercel",
  ".idea",
  ".vscode",
}

DOC_BASENAMES_BOOST = {
  "agents.md": 200,
  "readme.md": 120,
  "contributing.md": 90,
  "architecture.md": 80,
  "roadmap.md": 70,
  "decisions.md": 70,
  "adr.md": 70,
  "design.md": 70,
  "styleguide.md": 70,
  "ui.md": 70,
  "ux.md": 70,
  "components.md": 70,
  "theming.md": 70,
  "theme.md": 70,
  "branding.md": 70,
  "brand.md": 70,
  "accessibility.md": 70,
}

UI_HINTS = [
  "design system",
  "style guide",
  "styleguide",
  "component",
  "components",
  "shadcn",
  "radix",
  "tailwind",
  "tokens",
  "theme",
  "theming",
  "typography",
  "spacing",
  "color",
  "a11y",
  "accessibility",
]


def normalize_token(token: str) -> str:
  token = token.strip().lower()
  token = re.sub(r"[^a-z0-9]+", "-", token)
  token = re.sub(r"-{2,}", "-", token).strip("-")
  return token


def iter_markdown_files(root: Path, ignore_dirs: set[str]) -> Iterable[Path]:
  for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in ignore_dirs]

    for filename in filenames:
      lower = filename.lower()
      if lower == "agents.md" or lower.endswith(".md") or lower.endswith(".mdx"):
        yield Path(dirpath) / filename


def safe_read_prefix(path: Path, max_bytes: int) -> str:
  try:
    with path.open("rb") as f:
      data = f.read(max_bytes)
    return data.decode("utf-8", errors="replace")
  except OSError:
    return ""


def path_tokens(path: Path) -> list[str]:
  parts = []
  for part in path.as_posix().split("/"):
    parts.extend(re.split(r"[^a-zA-Z0-9]+", part))
  return [p.lower() for p in parts if p]


@dataclass(frozen=True)
class ScoredFile:
  relpath: str
  score: int
  reasons: tuple[str, ...]
  is_ui: bool
  is_feature_match: bool


def score_file(
  file_path: Path,
  root: Path,
  features: list[str],
  max_bytes: int,
) -> ScoredFile:
  relpath = file_path.relative_to(root).as_posix()
  lower_rel = relpath.lower()
  basename = file_path.name.lower()
  stem = file_path.stem.lower()

  score = 0
  reasons: list[str] = []

  base_boost = DOC_BASENAMES_BOOST.get(basename)
  if base_boost:
    score += base_boost
    reasons.append(f"common doc ({file_path.name})")

  if lower_rel.startswith("docs/") or "/docs/" in lower_rel:
    score += 25
    reasons.append("in docs/")

  if "/adr" in lower_rel or "/adrs" in lower_rel or "architecture" in lower_rel:
    score += 15
    reasons.append("architecture/adr")

  tokens = set(path_tokens(file_path.relative_to(root)))
  normalized_stem = normalize_token(stem)

  is_feature_match = False
  if features:
    for raw in features:
      ft = normalize_token(raw)
      if not ft:
        continue
      stem_hit = normalized_stem == ft or normalized_stem.endswith(f"-{ft}") or normalized_stem.startswith(f"{ft}-")
      path_hit = ft in lower_rel or ft in tokens
      if stem_hit:
        score += 60
        reasons.append(f"same/close name as feature ({raw})")
        is_feature_match = True
      elif path_hit:
        score += 35
        reasons.append(f"path matches feature ({raw})")
        is_feature_match = True

  prefix = safe_read_prefix(file_path, max_bytes=max_bytes)
  prefix_lower = prefix.lower()

  is_ui = False
  ui_hits = [h for h in UI_HINTS if h in prefix_lower or h.replace(" ", "-") in lower_rel]
  if ui_hits:
    score += min(50, 10 * len(set(ui_hits)))
    reasons.append("mentions UI/design guidance")
    is_ui = True

  if "todo" in prefix_lower or "tbd" in prefix_lower:
    score -= 5

  if not reasons:
    reasons.append("markdown doc")

  return ScoredFile(
    relpath=relpath,
    score=score,
    reasons=tuple(reasons),
    is_ui=is_ui,
    is_feature_match=is_feature_match,
  )


def format_report(scored: list[ScoredFile], limit: int) -> str:
  must_read = [s for s in scored if s.relpath.lower().endswith("agents.md")][:10]
  feature = [s for s in scored if s.is_feature_match and s not in must_read]
  ui = [s for s in scored if s.is_ui and s not in must_read and s not in feature]
  other = [s for s in scored if s not in must_read and s not in feature and s not in ui]

  def lines(items: list[ScoredFile], n: int) -> list[str]:
    out = []
    for s in items[:n]:
      reason = "; ".join(s.reasons[:2])
      out.append(f"- `{s.relpath}` — {reason}")
    return out

  parts: list[str] = []
  parts.append("# Docs Scout Report")

  if must_read:
    parts.append("\n## Must read")
    parts.extend(lines(must_read, n=min(10, limit)))

  if feature:
    parts.append("\n## Feature matches")
    parts.extend(lines(feature, n=min(limit, 20)))

  if ui:
    parts.append("\n## UI / design guidance")
    parts.extend(lines(ui, n=min(limit, 20)))

  remaining = max(0, limit - (len(must_read) + len(feature) + len(ui)))
  if other and remaining > 0:
    parts.append("\n## Other high-signal docs")
    parts.extend(lines(other, n=remaining))

  if not (must_read or feature or ui or other):
    parts.append("\n_No Markdown docs found._")

  return "\n".join(parts).strip() + "\n"


def main() -> int:
  parser = argparse.ArgumentParser(description="Find high-signal Markdown docs for planning.")
  parser.add_argument("--root", default=".", help="Repo root to scan (default: .)")
  parser.add_argument("--feature", action="append", default=[], help="Feature/module keyword (repeatable).")
  parser.add_argument("--limit", type=int, default=40, help="Max results in report.")
  parser.add_argument("--max-bytes", type=int, default=20000, help="Max bytes to read per file for scoring.")
  parser.add_argument(
    "--ignore-dir",
    action="append",
    default=[],
    help="Additional directory name to ignore (repeatable).",
  )
  args = parser.parse_args()

  root = Path(args.root).resolve()
  ignore_dirs = set(DEFAULT_IGNORE_DIRS) | set(args.ignore_dir)

  scored: list[ScoredFile] = []
  for md_file in iter_markdown_files(root, ignore_dirs=ignore_dirs):
    scored.append(score_file(md_file, root=root, features=args.feature, max_bytes=args.max_bytes))

  scored.sort(key=lambda s: (s.score, -len(s.relpath)), reverse=True)

  report = format_report(scored, limit=max(1, args.limit))
  print(report, end="")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
