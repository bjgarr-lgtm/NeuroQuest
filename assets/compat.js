/*! SootheBirb compat shim v1
    Fixes: "petPixelSVG is not defined" by providing a safe fallback.
    Include BEFORE your main bundle.
*/
(function(){
  if (typeof window === 'undefined') return;
  function _fallbackSVG(opts){
    opts = opts || {};
    var sz = opts.size || 128;
    var accent = opts.accent || '#00eaff';
    var accent2 = opts.accent2 || '#8a2be2';
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="'+sz+'" height="'+sz+'">'+
      '<defs><radialGradient id="g" cx=".5" cy=".35">'+
        '<stop offset="0%" stop-color="'+accent+'"/>'+
        '<stop offset="100%" stop-color="'+accent2+'"/>'+
      '</radialGradient></defs>'+
      '<ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)" opacity="0.95"/>'+
      '<circle cx="60" cy="48" r="18" fill="url(#g)" opacity="0.95"/>'+
      '<circle cx="54" cy="44" r="3" fill="#000"/>'+
      '<circle cx="66" cy="44" r="3" fill="#000"/>'+
      '<path d="M60 52 l8 5 -8 5 -8 -5z" fill="#ffd166"/>'+
      '</svg>'
    );
  }
  if (typeof window.petPixelSVG === 'undefined') {
    window.petPixelSVG = function(opts){ return _fallbackSVG(opts); };
  }
  if (typeof window.characterPixelSVG === 'undefined') {
    window.characterPixelSVG = function(opts){ return _fallbackSVG(opts); };
  }
  window.__SB_COMPAT_SHIM__ = "petPixelSVG";
})();