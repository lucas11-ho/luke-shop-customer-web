import React,{useCallback,useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{go}from'../app/router.js';
import{GoogleAuthButton,TelegramAuthButton,PhoneOtpPanel,TurnstileWidget}from'../components/AuthMethods.jsx';
import{Icon}from'../components/icons.jsx';

function AuthCard({mode,next}){
 const{api,login,register,loginWithGoogle,loginWithTelegram,requestPhoneOtp,loginWithPhone}=useAuth();
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[options,setOptions]=useState(null),[showPassword,setShowPassword]=useState(false);
 const[emailTurnstile,setEmailTurnstile]=useState(''),[socialTurnstile,setSocialTurnstile]=useState(''),[emailReset,setEmailReset]=useState(0),[socialReset,setSocialReset]=useState(0);
 const isRegister=mode==='register';
 useEffect(()=>{api.request('/v1/customer/auth/options',{auth:false}).then(d=>setOptions(d.data.auth)).catch(e=>setError(e.message))},[api]);
 const done=()=>go(next||'/');
 const turnstile=options?.turnstile||{};const methods=options?.methods;const emailTurnstileRequired=Boolean(turnstile.enabled&&(isRegister?turnstile.signup_required:turnstile.login_required));const socialTurnstileRequired=Boolean(turnstile.enabled&&turnstile.social_required);
 const submit=async e=>{e.preventDefault();if(emailTurnstileRequired&&!emailTurnstile){setError('Security verification is still preparing. Please try again in a moment.');return;}setBusy(true);setError('');try{if(isRegister)await register({email,password,displayName:name,turnstileToken:emailTurnstile});else await login({email,password,turnstileToken:emailTurnstile});done()}catch(err){setError(err.message);if(emailTurnstileRequired){setEmailTurnstile('');setEmailReset(v=>v+1)}}finally{setBusy(false)}};
 const google=useCallback(async credential=>{setError('');try{await loginWithGoogle(credential,socialTurnstile);done()}catch(e){setError(e.message);if(socialTurnstileRequired){setSocialTurnstile('');setSocialReset(v=>v+1)}}},[loginWithGoogle,next,socialTurnstile,socialTurnstileRequired]);
 const telegram=useCallback(async payload=>{setError('');try{await loginWithTelegram({...payload,turnstile_token:socialTurnstile});done()}catch(e){setError(e.message);if(socialTurnstileRequired){setSocialTurnstile('');setSocialReset(v=>v+1)}}},[loginWithTelegram,next,socialTurnstile,socialTurnstileRequired]);
 const telegramNonce=useCallback(async()=>{const r=await api.request('/v1/customer/auth/telegram/nonce',{auth:false});return r.data.nonce},[api]);
 const phoneVerify=async payload=>{await loginWithPhone(payload);done()};
 const hasSocial=Boolean(methods?.google?.enabled||methods?.telegram?.enabled);
 return <section className="auth-page auth-page-v093"><div className="auth-card auth-card-pro auth-card-mobile-first">
  <div className="auth-brand-row"><span className="auth-brand-mark">L</span><div><span className="eyebrow">Secure customer account</span><small>Protected access for this store</small></div></div>
  <div className="auth-heading"><h1>{isRegister?'Create your account':'Welcome back'}</h1><p>{isRegister?'Create your account with email, or use a trusted provider below.':'Sign in securely to continue shopping and manage your orders.'}</p></div>
  {methods?.email_password?.enabled&&<form className="auth-primary-form" onSubmit={submit}>
   {isRegister&&<label><span><Icon name="user" size={15}/> Display name</span><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name"/></label>}
   <label><span><Icon name="mail" size={15}/> Email</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email"/></label>
   <label><span><Icon name="lock" size={15}/> Password</span><span className="auth-password-field"><input required type={showPassword?'text':'password'} minLength="12" maxLength="128" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={isRegister?'new-password':'current-password'} placeholder="Minimum 12 characters"/><button type="button" className="password-visibility" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?'Hide':'Show'}</button></span><small>Minimum 12 characters.</small></label>
   {emailTurnstileRequired&&<TurnstileWidget siteKey={turnstile.site_key} action={isRegister?'signup':'login'} onToken={setEmailTurnstile} resetSignal={emailReset} appearance="interaction-only" size="flexible" showNote={false} className="turnstile-background-check"/>}
   <button className="btn btn-primary btn-full auth-primary-action" disabled={busy||(emailTurnstileRequired&&!emailTurnstile)}>{busy?'Please wait…':isRegister?'Create account':'Sign in'}</button>
  </form>}
  {hasSocial&&<div className="auth-social-section">
   <div className="auth-divider"><span>or continue with</span></div>
   {socialTurnstileRequired&&<TurnstileWidget siteKey={turnstile.site_key} action="social" onToken={setSocialTurnstile} resetSignal={socialReset} appearance="interaction-only" size="flexible" showNote={false} className="turnstile-background-check"/>}
   <div className="social-auth-row">
    {methods?.google?.enabled&&<GoogleAuthButton clientId={methods.google.client_id} compact disabled={socialTurnstileRequired&&!socialTurnstile} onCredential={google}/>} 
    {methods?.telegram?.enabled&&<TelegramAuthButton mode={methods.telegram.mode} clientId={methods.telegram.client_id} botUsername={methods.telegram.bot_username} nonceLoader={telegramNonce} compact disabled={socialTurnstileRequired&&!socialTurnstile} onAuth={telegram}/>} 
   </div>
  </div>}
  {methods?.phone?.enabled&&<><div className="auth-divider auth-divider-phone"><span>or use phone</span></div><PhoneOtpPanel countries={methods.phone.countries} onRequest={requestPhoneOtp} onVerify={phoneVerify}/></>}
  {error&&<div className="form-error auth-error-box" role="alert">{error}</div>}
  {!options&&!error&&<small className="muted auth-loading-note">Loading secure sign-in methods…</small>}
  {methods?.email_password?.enabled&&<div className="auth-switch">{isRegister?'Already have an account?':'Don’t have an account?'} <button onClick={()=>go(isRegister?'/login':'/register',{next})}>{isRegister?'Sign in':'Sign up'}</button></div>}
  {turnstile.enabled&&<div className="auth-security-foot auth-security-foot-compact"><Icon name="shield" size={14}/><span>Protected by Cloudflare Turnstile</span></div>}
 </div></section>;
}
export function LoginPage({next}){return <AuthCard mode="login" next={next}/>;}
export function RegisterPage({next}){return <AuthCard mode="register" next={next}/>;}
