
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.toddler = function(){
  // unify toddler gating: read settings and hide toddler-only elements when off
  const settings = JSON.parse(localStorage.getItem("sb.v2.settings")||"{}");
  const on = !!settings.toddler;
  document.querySelectorAll(".toddler-only").forEach(el=> el.classList.toggle("toddler-hidden", !on));
};
