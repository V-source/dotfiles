#!/bin/bash

# Obtener el layout actual del teclado
CURR_LANG=$(setxkbmap -print | grep xkb_symbols | awk '{print $4}' | awk -F"+" '{print $2}')

# Definir los códigos de idioma
US="us"
ES="es"

# Mostrar el código del idioma actual en mayúsculas
echo "${CURR_LANG^^}"
