import React from 'react';
import { Icon } from './icons.jsx';

const FILLED={
  home:<path d="M3.5 10.7 12 3.6l8.5 7.1v9.1a1.7 1.7 0 0 1-1.7 1.7h-4.3v-6.8h-5v6.8H5.2a1.7 1.7 0 0 1-1.7-1.7v-9.1Z"/>,
  grid:<><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></>,
  bag:<path d="M5.3 7.4h13.4l-1 12.3a1.8 1.8 0 0 1-1.8 1.6H8.1a1.8 1.8 0 0 1-1.8-1.6L5.3 7.4Zm4.1 0a2.6 2.6 0 0 1 5.2 0h1.8a4.4 4.4 0 0 0-8.8 0h1.8Z"/>,
  receipt:<path d="M5 2.8h14v19l-2.4-1.6-2.3 1.6-2.3-1.6-2.3 1.6-2.3-1.6L5 21.8v-19Zm3.5 6.4h7v-1.8h-7v1.8Zm0 4.3h7v-1.8h-7v1.8Z"/>,
  user:<><circle cx="12" cy="8" r="4.6"/><path d="M3.7 21c.5-5 3.5-7.5 8.3-7.5s7.8 2.5 8.3 7.5H3.7Z"/></>,
};

export function ThemeNavIcon({name,size=24,variant='outline'}){
  const filled=variant==='filled'||variant==='duotone';
  if(!filled||!FILLED[name])return <Icon name={name} size={size}/>;
  return <svg className={`icon icon-${name} theme-nav-icon theme-nav-icon-${variant}`} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" focusable="false">{FILLED[name]}</svg>;
}
