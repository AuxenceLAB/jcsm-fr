#!/bin/bash

# Fix installation-conformite.html hero image
sed -i '' 's|https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&h=1080&fit=crop|images/installation.jpeg|g' installation-conformite.html

# Fix exploitation.html hero image size
sed -i '' 's|<img src="images/maintenance.jpeg" alt="Exploitation IRVE" class="w-full h-full object-cover" loading="eager" width="1920" height="1080">|<img src="images/maintenance.jpeg" alt="Exploitation IRVE" class="w-full h-full object-cover" loading="eager" width="1920" height="1080" style="object-fit: cover; max-height: 80vh;">|g' exploitation.html

# Fix securisation-installations.html hero image size
sed -i '' 's|<img src="images/vandalisme.jpg" alt="Sécurisation des Installations IRVE" class="w-full h-full object-cover" loading="eager" width="1920" height="1080">|<img src="images/vandalisme.jpg" alt="Sécurisation des Installations IRVE" class="w-full h-full object-cover" loading="eager" width="1920" height="1080" style="object-fit: cover; max-height: 80vh;">|g' securisation-installations.html

# Fix pack images to fit in frame
sed -i '' 's|<img src="images/cable.jpg" alt="Pack Essentiel" class="w-full h-full object-cover rounded-2xl" loading="lazy" width="600" height="400">|<img src="images/cable.jpg" alt="Pack Essentiel" class="w-full h-64 object-cover rounded-2xl" loading="lazy" width="600" height="256">|g' securisation-installations.html

sed -i '' 's|<img src="images/camera.png" alt="Pack Avancé" class="w-full h-full object-cover rounded-2xl" loading="lazy" width="600" height="400">|<img src="images/camera.png" alt="Pack Avancé" class="w-full h-64 object-cover rounded-2xl" loading="lazy" width="600" height="256">|g' securisation-installations.html

sed -i '' 's|<img src="images/alarmecam.jpeg" alt="Pack Intégral" class="w-full h-full object-cover rounded-2xl" loading="lazy" width="600" height="400">|<img src="images/alarmecam.jpeg" alt="Pack Intégral" class="w-full h-64 object-cover rounded-2xl" loading="lazy" width="600" height="256">|g' securisation-installations.html

echo "✅ Toutes les corrections d'images appliquées"
