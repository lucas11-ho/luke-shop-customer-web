import React from 'react';

// Lightweight inline line-icon set (no external dependency).
// 24x24 viewBox, stroke=currentColor. Pair every status icon with text at call sites.
const P = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>,
  bag: <><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
  'shopping-bag': <><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
  home: <><path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.2"/><rect x="13" y="4" width="7" height="7" rx="1.2"/><rect x="4" y="13" width="7" height="7" rx="1.2"/><rect x="13" y="13" width="7" height="7" rx="1.2"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>,
  receipt: <><path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21V3Z"/><path d="M9 8h6M9 12h6"/></>,
  'chevron-down': <path d="m6 9 6 6 6-6"/>,
  'chevron-right': <path d="m9 6 6 6-6 6"/>,
  'arrow-right': <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  x: <path d="M6 6 18 18M18 6 6 18"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  check: <path d="m5 12 5 5L20 6"/>,
  'check-circle': <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/></>,
  'map-pin': <><path d="M12 21c5-5.5 7-8.6 7-11a7 7 0 1 0-14 0c0 2.4 2 5.5 7 11Z"/><circle cx="12" cy="10" r="2.4"/></>,
  locate: <><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></>,
  navigation: <path d="M4 11 20 4l-7 16-2-7-7-2Z"/>,
  truck: <><path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></>,
  scooter: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 18h8m-8 0-.6-4H4"/><path d="m16 18-3-9h-2"/><path d="M13 9h3l2 5"/></>,
  package: <><path d="m3 8 9-4 9 4-9 4-9-4Z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/></>,
  'package-check': <><path d="M21 10 12 6 3 10l9 4 3-1.3"/><path d="M3 10v6l9 4 3-1.3"/><path d="m15 18 2 2 4-4"/></>,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1.4"/><path d="M4 13h16M12 9v11"/><path d="M12 9c-2.5 0-4-1-4-2.5S9 5 12 9c3-4 4-2 4-2.5S14.5 9 12 9Z"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  radar: <><circle cx="12" cy="12" r="9"/><path d="M12 12 17 7"/><path d="M12 12a4 4 0 1 0 4 4"/></>,
  cog: <><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3m-2.6-6.4-2 2m-6.8 6.8-2 2m0-10.8 2 2m6.8 6.8 2 2"/></>,
  'chef-hat': <><path d="M7 20h10v-6a4 4 0 0 0 .7-7.9 4 4 0 0 0-7.7-1.1A3.5 3.5 0 0 0 6.3 6 4 4 0 0 0 7 14v6Z"/><path d="M7 17h10"/></>,
  'alert-triangle': <><path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4"/><path d="M12 17h.01"/></>,
  'x-circle': <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></>,
  sparkles: <><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/><path d="M18 15l.8 2 .2.8 2 .8-2 .2-.2 2-.8-2-2-.2 2-.8Z"/></>,
  headset: <><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><path d="M4 13h2.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4Z"/><path d="M20 13h-2.5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1v-4Z"/><path d="M20 17v1a3 3 0 0 1-3 3h-3"/></>,
  trash: <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></>,
  edit: <><path d="M4 20h4L18 10l-4-4L4 16v4Z"/><path d="m14 6 4 4"/></>,
  shield: <><path d="M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M9 20h6M12 16v4"/></>,
  smartphone: <><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></>,
  share: <><circle cx="6" cy="12" r="2.4"/><circle cx="17" cy="6" r="2.4"/><circle cx="17" cy="18" r="2.4"/><path d="m8 11 7-4M8 13l7 4"/></>,
  unlock: <><rect x="5" y="11" width="14" height="9" rx="1.8"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></>,
  download: <><path d="M12 4v10m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/></>,
  star: <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.6-.8L12 4Z"/>,
  heart: <path d="M12 20S4 15 4 9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 8 2.5C20 15 12 20 12 20Z"/>,
  tag: <><path d="M4 4h7l9 9-7 7-9-9V4Z"/><circle cx="8" cy="8" r="1.4"/></>,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>,
  sliders: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  phone: <><path d="M7 4h3l1 5-2 1a14 14 0 0 0 5 5l1-2 5 1v3c0 1-1 2-2 2C10 19 5 14 5 6c0-1 1-2 2-2Z"/></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  bell: <><path d="M6 16h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4L6 16Z"/><path d="M10 19h4"/></>,
  camera: <><path d="M4 8h4l1.5-2h5L16 8h4v11H4V8Z"/><circle cx="12" cy="13" r="3"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
  key: <><circle cx="8" cy="12" r="4"/><path d="M12 12h9M17 12v3M20 12v2"/></>,
  address: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5M8 16h6"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></>,
  logout: <><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 12H3m0 0 3-3m-3 3 3 3"/></>,
};

export function Icon({ name, size = 20, strokeWidth = 1.8, className = '', ...rest }) {
  const inner = P[name] || P.info;
  return (
    <svg
      className={`icon icon-${name} ${className}`.trim()}
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >{inner}</svg>
  );
}
