import re
import json

with open('login_generated.html', 'r', encoding='utf-8') as f:
    c = f.read()

m = re.search(r'"colors":\s*(\{.*?\})', c, re.DOTALL)
if m:
    colors = json.loads(m.group(1))
    css = "@import 'tailwindcss';\n@theme {\n"
    for k, v in colors.items():
        css += f"  --color-{k}: {v};\n"
    css += "  --font-headline: 'Plus Jakarta Sans', sans-serif;\n"
    css += "  --font-body: 'Plus Jakarta Sans', sans-serif;\n"
    css += "  --font-label: 'Public Sans', sans-serif;\n}\n"
    css += """
@layer base {
  body {
    background-color: theme('colors.background');
    color: theme('colors.on-background');
    font-family: theme('fontFamily.body');
  }
}
"""
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("Done")
else:
    print("Could not find colors")
