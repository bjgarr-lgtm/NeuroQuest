
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.calendar = function(){
  // If there is a #weekGrid or .calendar section, inject an iframe
  const host = document.querySelector(".calendar") || document.querySelector("#weekGrid") || document.querySelector("#view");
  if(!host || !SB_HOTFIX._bind(host,"calendar")) return;
  const saved = localStorage.getItem("sb.v2.calendar.src");
  const src = saved || "https://calendar.google.com/calendar/embed?src=family01796908780144573692%40group.calendar.google.com&ctz=America%2FLos_Angeles";
  const wrap = document.createElement("div");
  wrap.style.width="100%"; wrap.style.minHeight="600px"; wrap.style.border="0";
  wrap.innerHTML = `<iframe src="${src}" style="border:0;width:100%;height:720px" loading="lazy"></iframe>`;
  host.prepend(wrap);
};
