#!/usr/bin/env python3

from __future__ import annotations

import sys
from pathlib import Path


def fail(message: str) -> int:
  print(f"ERROR: {message}", file=sys.stderr)
  return 1


def read_text(path: Path) -> str:
  return path.read_text(encoding="utf-8")


def validate_frontmatter(skill_md: Path) -> int:
  text = read_text(skill_md)
  lines = text.splitlines()
  if len(lines) < 3 or lines[0].strip() != "---":
    return fail("SKILL.md must start with YAML frontmatter '---'")

  try:
    end_idx = lines.index("---", 1)
  except ValueError:
    return fail("SKILL.md frontmatter must be closed with '---'")

  fm_lines = [ln.rstrip() for ln in lines[1:end_idx] if ln.strip()]
  kv = {}
  for ln in fm_lines:
    if ":" not in ln:
      return fail(f"Invalid frontmatter line: {ln!r}")
    key, value = ln.split(":", 1)
    key = key.strip()
    value = value.strip()
    kv[key] = value

  allowed = {"name", "description"}
  extra = sorted(set(kv.keys()) - allowed)
  missing = sorted(allowed - set(kv.keys()))

  if missing:
    return fail(f"Missing frontmatter keys: {', '.join(missing)}")
  if extra:
    return fail(f"Unexpected frontmatter keys: {', '.join(extra)}")
  if not kv["name"]:
    return fail("Frontmatter 'name' must be non-empty")
  if not kv["description"]:
    return fail("Frontmatter 'description' must be non-empty")
  return 0


def validate_openai_yaml(openai_yaml: Path) -> int:
  text = read_text(openai_yaml)
  required_snippets = [
    "interface:",
    "display_name:",
    "short_description:",
    "default_prompt:",
  ]
  for snip in required_snippets:
    if snip not in text:
      return fail(f"agents/openai.yaml missing {snip!r}")
  if "$planning-docs-scout" not in text:
    return fail("agents/openai.yaml default_prompt must mention $planning-docs-scout")
  return 0


def main() -> int:
  skill_dir = Path(__file__).resolve().parents[1]

  skill_md = skill_dir / "SKILL.md"
  openai_yaml = skill_dir / "agents" / "openai.yaml"
  scout = skill_dir / "scripts" / "docs_scout.py"

  for required in [skill_md, openai_yaml, scout]:
    if not required.exists():
      return fail(f"Missing required file: {required}")

  for check in [validate_frontmatter(skill_md), validate_openai_yaml(openai_yaml)]:
    if check != 0:
      return check

  print("OK: skill structure looks valid")
  return 0


if __name__ == "__main__":
  raise SystemExit(main())

