from pathlib import Path

IGNORE = {
    ".git",
    "__pycache__",
    ".venv",
    "venv",
    "node_modules",
    ".next",
    "dist",
    "build",
    ".idea",
    ".vscode"
}

def tree(directory: Path, prefix=""):
    items = sorted(
        [x for x in directory.iterdir() if x.name not in IGNORE],
        key=lambda x: (x.is_file(), x.name.lower())
    )

    for i, item in enumerate(items):
        connector = "└── " if i == len(items) - 1 else "├── "
        print(prefix + connector + item.name)

        if item.is_dir():
            extension = "    " if i == len(items) - 1 else "│   "
            tree(item, prefix + extension)

root = Path(".")
print(f"# {root.resolve().name}\n")
print("```text")
tree(root)
print("```")