import os
import re

files = [
    "a-propos.html",
    "centre-appel.html",
    "exploitation.html",
    "installation-conformite.html",
    "pilotage-projets.html",
    "securisation-installations.html",
    "mentions-legales.html",
    "cgv.html",
    "confidentialite.html",
    "404.html"
]

base_dir = "/Users/auxence/Desktop/JCSM/Final"

# Style removal regex (aggressive)
style_regex = re.compile(r'<style>.*?</style>', re.DOTALL)

# Script removal regex (aggressive, targeting the big inline block)
# We look for a script that contains typical inline code we want to remove
script_content_indicators = [
    "Barre de progression",
    "Initialisation du body",
    "Création des particules",
    "Transitions de page smooth"
]

def refactor_file(filename):
    path = os.path.join(base_dir, filename)
    if not os.path.exists(path):
        print(f"Skipping {filename} (not found)")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_len = len(content)

    # 1. Remove Style Block
    # We only remove if it looks like the big internal style block (e.g. contains 'html, body {')
    if "html, body {" in content or "body.loaded {" in content:
         content = style_regex.sub('', content)

    # 2. Remove Script Block
    # We find <script> tags and check content
    def replace_script(match):
        script_content = match.group(0)
        for indicator in script_content_indicators:
            if indicator in script_content:
                return "" # Remove it
        return script_content # Keep it

    script_regex = re.compile(r'<script>.*?</script>', re.DOTALL)
    content = script_regex.sub(replace_script, content)

    # 3. Add Links and Scripts
    # Check if links exist, if not add them
    if 'js/utils.js' not in content:
        # Add before </body>
        new_scripts = """
    <script src="js/utils.js"></script>
    <script src="js/public.js"></script>
    <script src="animations.js" defer></script>
"""
        if "</body>" in content:
            content = content.replace("</body>", new_scripts + "</body>")
        else:
            content += new_scripts
    
    # 4. Clean up empty lines created by removal
    # (Optional, but good for cleanliness)
    
    # 5. Ensure styles.css is linked (it should be, but just in case)
    if 'styles.css' not in content:
        if '</head>' in content:
            content = content.replace('</head>', '<link rel="stylesheet" href="styles.css">\n</head>')

    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Processed {filename}: Size {original_len} -> {len(content)}")

for file in files:
    refactor_file(file)
