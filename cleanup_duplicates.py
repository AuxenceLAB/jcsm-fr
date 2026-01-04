import os

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

def clean_file(filename):
    path = os.path.join(base_dir, filename)
    if not os.path.exists(path):
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove all occurrences of animations.js script
    target = '<script src="animations.js" defer></script>'
    if content.count(target) > 1:
        # Keep only the last one? Or remove all and add one.
        content = content.replace(target, '')
        # Add simpler version at end
        content = content.replace('</body>', f'    {target}\n</body>')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Cleaned {filename}")

for file in files:
    clean_file(file)
