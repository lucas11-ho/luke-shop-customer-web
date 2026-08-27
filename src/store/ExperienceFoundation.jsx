import React,{useEffect}from'react';
import{useStore}from'./StoreContext.jsx';

const HEX=/^#[0-9a-fA-F]{6}$/;
const FALLBACK={primary:'#13713d',secondary:'#0f5132',accent:'#18a56d',background:'#f8f7f2',surface:'#ffffff',text:'#10150f',muted:'#70776f',success:'#168552',danger:'#c63e35'};
const RADIUS={small:{control:'8px',card:'12px',media:'10px',sheet:'16px'},medium:{control:'11px',card:'18px',media:'14px',sheet:'22px'},large:{control:'14px',card:'24px',media:'18px',sheet:'28px'},xl:{control:'18px',card:'32px',media:'24px',sheet:'36px'}};
const DENSITY={compact:{section:'30px',card:'14px',gap:'12px',controlY:'9px',header:'62px'},comfortable:{section:'42px',card:'18px',gap:'18px',controlY:'11px',header:'70px'},spacious:{section:'56px',card:'22px',gap:'24px',controlY:'13px',header:'76px'}};

function color(value,key){return HEX.test(String(value||''))?value:FALLBACK[key]}
function contrast(hex){
 const value=String(hex||'').replace('#','');if(value.length!==6)return'#ffffff';
 const rgb=[0,2,4].map(i=>parseInt(value.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);
 const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];return luminance>.48?'#111827':'#ffffff';
}
function set(root,key,value){root.style.setProperty(key,value)}

export function ExperienceFoundation(){
 const{experience,effectiveBranding}=useStore();
 useEffect(()=>{
  const root=document.documentElement,theme=experience?.theme||{},radius=RADIUS[theme.radius]||RADIUS.medium,density=DENSITY[theme.density]||DENSITY.comfortable;
  const primary=color(theme.primary||effectiveBranding?.accent,'primary'),secondary=color(theme.secondary,'secondary'),accent=color(theme.accent,'accent'),background=color(theme.background,'background'),surface=color(theme.surface,'surface'),ink=color(theme.text,'text'),muted=color(theme.muted_text,'muted'),success=color(theme.success,'success'),danger=color(theme.danger,'danger');
  root.dataset.cxFoundation='v4';
  set(root,'--accent',primary);set(root,'--accent2',secondary);set(root,'--accent3',accent);set(root,'--bg',background);set(root,'--surface',surface);set(root,'--ink',ink);set(root,'--muted',muted);set(root,'--success',success);set(root,'--danger',danger);set(root,'--good',success);
  set(root,'--accent-contrast',contrast(primary));set(root,'--secondary-contrast',contrast(secondary));set(root,'--accent-dark',`color-mix(in srgb, ${primary} 82%, #000000)`);set(root,'--line',`color-mix(in srgb, ${ink} 12%, ${surface})`);set(root,'--soft',`color-mix(in srgb, ${ink} 4%, ${surface})`);set(root,'--cx-focus',`color-mix(in srgb, ${primary} 22%, transparent)`);set(root,'--cx-surface-raised',`color-mix(in srgb, ${surface} 96%, ${ink})`);
  set(root,'--cx-radius-control',radius.control);set(root,'--cx-radius-card',radius.card);set(root,'--cx-radius-media',radius.media);set(root,'--cx-radius-sheet',radius.sheet);set(root,'--cx-section-block',density.section);set(root,'--cx-card-pad',density.card);set(root,'--cx-grid-gap',density.gap);set(root,'--cx-control-y',density.controlY);set(root,'--cx-header-height',density.header);set(root,'--cx-content-max','1240px');set(root,'--cx-shadow-card','0 10px 30px color-mix(in srgb, var(--ink) 8%, transparent)');set(root,'--cx-shadow-float','0 22px 60px color-mix(in srgb, var(--ink) 15%, transparent)');
 },[experience,effectiveBranding]);
 return null;
}
