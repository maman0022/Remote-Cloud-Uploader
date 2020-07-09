"use strict";
if (!browser.menus || !browser.menus.getTargetElement) {
  var menuTarget = null;
  let cleanupIfNeeded = () => {
    if (menuTarget && !document.contains(menuTarget)) menuTarget = null;
  };
  document.addEventListener("contextmenu", (event) => {
    menuTarget = event.target;
  }, true);
  document.addEventListener("visibilitychange", cleanupIfNeeded, true);
  browser.menus = browser.menus || {};
  browser.menus.getTargetElement = () => {
    cleanupIfNeeded();
    return menuTarget;
  }
};