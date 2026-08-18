import React,{useCallback,useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{go}from'../app/router.js';
import{GoogleAuthButton,TelegramAuthButton,PhoneOtpPanel,TurnstileWidget}from'../components/AuthMethods.jsx';
import{Icon}from'../components/icons.jsx';

function AuthCard({mode,next}){
 const{api,login,register,loginWithGoogle,loginWithTelegram,requestPhoneOtp,loginWithPhone}=useAuth();
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[options,setOptions]=useState(null);
 const[emailTurnstile,setEmailTurnstile]=useState(''),[socialTurnstile,setSocialTurnstile]=useState(''),[emailReset,setEmailReset]=useState(0),[socialReset,setSocialReset]=useState(0);
 const isRegister=mode==='register';
 useEffect(()=>{api.request('/v1/customer/auth/options',{auth:false}).then(d=>setOptions(d.data.auth)).catch(e=>setError(e.message))},[api]);
 const done=()=>go(next||'/');
 const turnstile=options?.turnstile||{};const methods=options?.methods;const emailTurnstileRequired=Boolean(turnstile.enabled&&(isRegister?turnstile.signup_required:turnstile.login_required));const socialTurnstileRequired=Boolean(turnstile.enabled&&turnstile.social_required);
 const submit=async e=>{e.preventDefault();if(emailTurnstileRequired&&!emailTurnstile){setError('Complete the Cloudflare security verification first.');return;}setBusy(true);setError('');try{if(isRegister)await register({email,password,displayName:name,turnstileToken:emailTurnstile});else await login({email,password,turnstileToken:emailTurnstile});done()}catch(err){setError(err.message);if(emailTurnstileRequired){setEmailTurnstile('');setEmailReset(v=>v+1)}}finally{setBusy(false)}};
 const google=useCallback(async credential=>{setError('');try{await loginWithGoogle(credential,socialTurnstile);done()}catch(e){setError(e.message);if(socialTurnstileRequired){setSocialTurnstile('');setSocialReset(v=>v+1)}}},[loginWithGoogle,next,socialTurnstile,socialTurnstileRequired]);
 const telegram=useCallback(async payload=>{setError('');try{await loginWithTelegram({...payload,turnstile_token:socialTurnstile});done()}catch(e){setError(e.message);if(socialTurnstileRequired){setSocialTurnstile('');setSocialReset(v=>v+1)}}},[loginWithTelegram,next,socialTurnstile,socialTurnstileRequired]);
 const telegramNonce=useCallback(async()=>{const r=await api.request('/v1/customer/auth/telegram/nonce',{auth:false});return r.data.nonce},[api]);
 const phoneVerify=async payload=>{await loginWithPhone(payload);done()};
 const hasSocial=Boolean(methods?.google?.enabled||methods?.telegram?.enabled);
 return <section className="auth-page auth-page-v091"><div className="auth-card auth-card-pro"><div className="auth-brand-row"><span className="auth-brand-mark">L</span><div><span className="eyebrow">Secure customer account</span><small>Protected sign-in for this store</small></div></div><h1>{isRegister?'Create your account':'Welcome back'}</h1><p>{isRegister?'Choose a trusted sign-up method. You can connect more login methods later from Profile → Login & security.':'Choose one of the secure login methods enabled by this store.'}</p>
  {hasSocial&&socialTurnstileRequired&&<div className="social-turnstile-block"><TurnstileWidget siteKey={turnstile.site_key} action="social" onToken={setSocialTurnstile} resetSignal={socialReset}/><small className="muted">Complete verification before using Google or Telegram.</small></div>}
  {methods?.google?.enabled&&<GoogleAuthButton clientId={methods.google.client_id} disabled={socialTurnstileRequired&&!socialTurnstile} onCredential={google}/>} 
  {methods?.telegram?.enabled&&<TelegramAuthButton mode={methods.telegram.mode} clientId={methods.telegram.client_id} botUsername={methods.telegram.bot_username} nonceLoader={telegramNonce} disabled={socialTurnstileRequired&&!socialTurnstile} onAuth={telegram}/>} 
  {methods?.phone?.enabled&&<PhoneOtpPanel countries={methods.phone.countries} onRequest={requestPhoneOtp} onVerify={phoneVerify}/>} 
  {methods?.email_password?.enabled&&<><div className="auth-divider"><span>or use email</span></div><form onSubmit={submit}>{isRegister&&<label>Display name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name"/></label>}<label><span><Icon name="mail" size={15}/> Email</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label><span><Icon name="lock" size={15}/> Password</span><input required type="password" minLength="12" maxLength="128" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={isRegister?'new-password':'current-password'}/><small>Minimum 12 characters.</small></label>{emailTurnstileRequired&&<TurnstileWidget siteKey={turnstile.site_key} action={isRegister?'signup':'login'} onToken={setEmailTurnstile} resetSignal={emailReset}/>}<button className="btn btn-primary btn-full" disabled={busy||(emailTurnstileRequired&&!emailTurnstile)}>{busy?'Please wait…':isRegister?'Create account':'Sign in'}</button></form></>}
  {error&&<div className="form-error auth-error-box">{error}</div>}{!options&&!error&&<small className="muted">Loading secure sign-in methods…</small>}{methods?.email_password?.enabled&&<div className="auth-switch">{isRegister?'Already have an account?':'Don’t have an account?'} <button onClick={()=>go(isRegister?'/login':'/register',{next})}>{isRegister?'Sign in':'Sign up now'}</button></div>}
  <div className="auth-security-foot"><Icon name="shield" size={15}/><span>Google and Telegram identities are verified by the provider. Cloudflare Turnstile is validated by Luke Shop Backend when required.</span></div>
 </div></section>;
}
export function LoginPage({next}){return <AuthCard mode="login" next={next}/>;}
export function RegisterPage({next}){return <AuthCard mode="register" next={next}/>;}
