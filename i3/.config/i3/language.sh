# #!/bin/bash

# Obtener el layout actual
CURRENT_LAYOUT=$(setxkbmap -print | grep xkb_symbols | awk '{print $4}' | awk -F"+" '{print $2}')

# Mostrar el código del idioma actual en minúsculas
echo "${CURRENT_LAYOUT,,}"



