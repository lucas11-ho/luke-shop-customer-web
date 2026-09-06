import React from'react';
import{PHOSPHOR_NAV_ICON_KEYS,ThemeNavIcon}from'./ThemeNavIcon.jsx';

const API_BASE=String(import.meta.env.VITE_LUKE_SHOP_API_BASE_URL||'http://localhost:4100').replace(/\/$/,'');
const KEY=/^[A-Z0-9][A-Z0-9._-]{2,79}$/;
const GLYPHS=new Set(PHOSPHOR_NAV_ICON_KEYS);
const normalizeKey=value=>{const key=String(value||'').trim().toUpperCase();return KEY.test(key)?key:''};
const assetUrl=(key,variant='default')=>{const safe=normalizeKey(key);if(!safe)return'';const suffix=variant==='default'?'':`?variant=${encodeURIComponent(variant)}`;return `${API_BASE}/v1/icon-assets/${encodeURIComponent(safe)}${suffix}`};

export function PlatformIconArtwork({icon,size=32,className=''}){
 if(!icon)return null;
 if(icon.source_type==='CUSTOM_IMAGE'){
   const key=normalizeKey(icon.key),base=assetUrl(key);if(!base)return null;
   const variants=icon.asset_variants||{};
   return <picture className={`platform-artwork-picture ${className}`.trim()}>{variants.dark&&<source media="(prefers-color-scheme: dark)" srcSet={assetUrl(key,'dark')}/>} {variants.light&&<source media="(prefers-color-scheme: light)" srcSet={assetUrl(key,'light')}/>}<img className="platform-artwork-image" src={base} width={size} height={size} alt="" loading="lazy" decoding="async"/></picture>;
 }
 const glyph=String(icon.library_icon||'').toLowerCase();
 if(icon.source_type==='LIBRARY'&&icon.library_pack==='PHOSPHOR'&&GLYPHS.has(glyph)){
   const variant=icon.color_mode==='DUOTONE'?'duotone':'outline';
   return <span className={`platform-artwork-glyph ${className}`.trim()}><ThemeNavIcon name={glyph} size={size} variant={variant} pack="PHOSPHOR_NAV"/></span>;
 }
 return null;
}

export function attachCategoryIcons(categories=[],references=[]){
 const byId=new Map((Array.isArray(references)?references:[]).map(row=>[row?.category_id,row?.icon||null]));
 return (Array.isArray(categories)?categories:[]).map(category=>({...category,icon:byId.get(category.public_id)||null}));
}
