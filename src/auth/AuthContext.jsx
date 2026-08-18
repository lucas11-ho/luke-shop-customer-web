import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {createApi,getStorefrontRuntimeContext,readStoredSession,writeStoredSession} from '../api/client.js';
const AuthContext=createContext(null);
export function AuthProvider({children}){
  const[session,setSessionState]=useState(()=>readStoredSession());const[contextTenant,setContextTenant]=useState('');
  const setSession=(next)=>{setSessionState(next);writeStoredSession(next);};
  useEffect(()=>{const onContext=(event)=>{const slug=event.detail?.tenantSlug||'';setContextTenant(slug);if(!slug)return;setSessionState(current=>{if(current?.tenantSlug&&slug&&current.tenantSlug===slug)return current;if(current){writeStoredSession(null);return null;}return current;});};window.addEventListener('luke-shop:storefront-context',onContext);const current=getStorefrontRuntimeContext();if(current.tenantSlug)onContext({detail:current});return()=>window.removeEventListener('luke-shop:storefront-context',onContext);},[]);
  const api=useMemo(()=>createApi({getSession:()=>session,onSession:setSession}),[session]);
  const acceptAuth=(data)=>{const tenantSlug=getStorefrontRuntimeContext().tenantSlug,t=data.data.tokens;const next={tenantSlug,accessToken:t.access_token,refreshToken:t.refresh_token,expiresIn:t.expires_in,customer:data.data.customer};setSession(next);return next;};
  const login=async({email,password,turnstileToken=''})=>acceptAuth(await api.request('/v1/customer/auth/login',{method:'POST',body:{email,password,turnstile_token:turnstileToken||undefined},auth:false}));
  const register=async({email,password,displayName,turnstileToken=''})=>acceptAuth(await api.request('/v1/customer/auth/register',{method:'POST',body:{email,password,display_name:displayName,turnstile_token:turnstileToken||undefined},auth:false}));
  const loginWithGoogle=async(credential,turnstileToken='')=>acceptAuth(await api.request('/v1/customer/auth/google',{method:'POST',body:{credential,turnstile_token:turnstileToken||undefined},auth:false}));
  const loginWithTelegram=async payload=>acceptAuth(await api.request('/v1/customer/auth/telegram',{method:'POST',body:payload,auth:false}));
  const requestPhoneOtp=async body=>(await api.request('/v1/customer/auth/phone/request',{method:'POST',body,auth:false})).data;
  const loginWithPhone=async body=>acceptAuth(await api.request('/v1/customer/auth/phone/verify',{method:'POST',body,auth:false}));
  const isAuthenticated=Boolean(session?.accessToken&&contextTenant&&session?.tenantSlug===contextTenant);
  const logout=async()=>{try{if(isAuthenticated)await api.request('/v1/customer/auth/logout',{method:'POST',body:{},auth:true});}catch{}finally{setSession(null);location.hash='#/';}};
  const refreshProfile=async()=>{if(!isAuthenticated)return null;const data=await api.request('/v1/customer/me',{auth:true});const next={...session,customer:data.data.customer};setSession(next);return data.data;};
  return <AuthContext.Provider value={{session,isAuthenticated,api,login,register,loginWithGoogle,loginWithTelegram,requestPhoneOtp,loginWithPhone,logout,refreshProfile}}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
