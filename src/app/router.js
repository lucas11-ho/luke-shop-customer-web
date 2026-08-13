import {useEffect,useState} from 'react';
export function routeNow(){const raw=location.hash.replace(/^#/,'')||'/';const[url,queryString='']=raw.split('?');return{path:url||'/',query:new URLSearchParams(queryString)};}
export function useRoute(){const[route,setRoute]=useState(routeNow());useEffect(()=>{const f=()=>setRoute(routeNow());addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f);},[]);return route;}
export function go(path,query={}){const q=new URLSearchParams();Object.entries(query).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')q.set(k,String(v));});location.hash=`#${path}${q.size?`?${q}`:''}`;}
export function match(path,pattern){const a=path.split('/').filter(Boolean),b=pattern.split('/').filter(Boolean);if(a.length!==b.length)return null;const params={};for(let i=0;i<b.length;i++){if(b[i].startsWith(':'))params[b[i].slice(1)]=decodeURIComponent(a[i]);else if(a[i]!==b[i])return null;}return params;}
