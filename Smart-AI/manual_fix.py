import os
import json

def fix_file(path):
    if not os.path.isfile(path): return
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        # Strip leading/trailing quotes if they exist as a pair
        # Or even if they don't, if they look like log artifacts
        while content.startswith('"'):
            content = content[1:]
        while content.endswith('"'):
            content = content[:-1]
            
        # Unescape literal sequences
        content = content.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\').replace('\\t', '\t')
        
        # Ensure 'use client' has its quote back if we stripped it
        if content.startswith('use client";'):
            content = '"' + content
            
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")
    except Exception as e:
        print(f"Error {path}: {e}")

files = [
    "app/page.tsx",
    "components/layout/sidebar-shell.tsx",
    "app/live-trainer/page.tsx",
    "app/globals.css",
    "tailwind.config.ts",
    "app/layout.tsx",
    "app/chatbot/page.tsx",
    "app/medical/page.tsx",
    "live_trainer_web.py"
]

for f in files:
    fix_file(f)
