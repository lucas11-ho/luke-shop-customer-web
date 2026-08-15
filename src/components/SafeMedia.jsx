import React,{useEffect,useState}from'react';

export function SafeImage({src,alt='',fallback=null,onError,...props}){
 const[failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[src]);
 if(!src||failed)return fallback;
 return <img {...props} src={src} alt={alt} onError={event=>{setFailed(true);onError?.(event)}}/>;
}
