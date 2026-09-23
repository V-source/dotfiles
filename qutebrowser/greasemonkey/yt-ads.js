// ==UserScript==
// for more updated scripts, see: https://greasyfork.org/en/scripts/by-site/youtube.com
// @name         Auto Skip YouTube Ads
// @version      1.1.0
// @description  Speed up and skip YouTube ads automatically
// @author       jso8910 and others
// @match        *://*.youtube.com/*
// ==/UserScript==


// document.addEventListener('load', () => {
//   const btn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button-modern')
//   if (btn) {
//     btn.click()
//   }
//   const ad = [...document.querySelectorAll('.ad-showing')][0];
//   if (ad) {
//     document.querySelector('video').currentTime = 9999999999;
//   }
// }, true);


// ==UserScript==
// @name         Auto Skip YouTube Ads (qutebrowser Fix)
// @version      2.0.0
// @description  Vigila y elimina anuncios de YouTube al instante
// @author       AI Assistant
// @match        *://*.youtube.com/*
// @run-at       document-start
// ==/UserScript==

const skipAds = () => {
  // 1. Acelerar el video del anuncio al máximo y saltarlo
  const video = document.querySelector('video');
  const adShowing = document.querySelector('.ad-showing, .ad-interrupting');

  if (adShowing && video) {
    // En lugar de cambiar el tiempo, subimos la velocidad a 16x y silenciamos
    video.muted = true;
    video.playbackRate = 16;
    video.currentTime = video.duration || 9999;
  }

  // 2. Hacer clic automático en cualquier botón de "Saltar" actual o futuro
  const skipButtons = [
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-ad-skip-button-slot',
    '[class*="ytp-ad-skip-button"]' // Busca cualquier clase que contenga el texto
  ];

  for (const selector of skipButtons) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.click();
    }
  }

  // 3. Eliminar banners e intersticiales molestos de la interfaz
  const overlays = document.querySelectorAll('.ytp-ad-overlay-container, ytd-banner-renderer');
  overlays.forEach(el => el.style.display = 'none');
};

// Configurar el observador para que vigile cambios en la página web en tiempo real
const observer = new MutationObserver(skipAds);

window.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  // Primera ejecución rápida
  skipAds();
});
