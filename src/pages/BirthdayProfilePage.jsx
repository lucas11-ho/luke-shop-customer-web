import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{Empty,Toast}from'../components/UI.jsx';
import{Icon}from'../components/icons.jsx';
import{go}from'../app/router.js';

function calendarDate(value){
  if(!value)return'';
  const match=String(value).match(/^\d{4}-\d{2}-\d{2}/);
  if(match)return match[0];
  const parsed=new Date(value);
  return Number.isNaN(parsed.getTime())?'':parsed.toISOString().slice(0,10);
}

function localToday(){
  const now=new Date();
  const year=now.getFullYear();
  const month=String(now.getMonth()+1).padStart(2,'0');
  const day=String(now.getDate()).padStart(2,'0');
  return`${year}-${month}-${day}`;
}

export function BirthdayProfilePage(){
  const{session,isAuthenticated,api,refreshProfile}=useAuth();
  const[birthDate,setBirthDate]=useState(()=>calendarDate(session?.customer?.birth_date));
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState('');
  const[toast,setToast]=useState('');
  const today=useMemo(localToday,[]);

  useEffect(()=>setBirthDate(calendarDate(session?.customer?.birth_date)),[session?.customer?.birth_date]);

  if(!isAuthenticated)return <section className="section"><Empty title="Sign in to manage your birthday" action={<button className="btn btn-primary" onClick={()=>go('/login',{next:'/profile/birthday'})}>Sign in</button>}/></section>;

  const save=async event=>{
    event.preventDefault();
    setBusy(true);setError('');
    try{
      await api.request('/v1/customer/me',{method:'PATCH',auth:true,body:{birth_date:birthDate||null}});
      const refreshed=await refreshProfile();
      setBirthDate(calendarDate(refreshed?.customer?.birth_date));
      setToast(birthDate?'Birthday saved':'Birthday removed');
    }catch(nextError){setError(nextError.message)}finally{setBusy(false)}
  };

  return <section className="section profile-subpage">
    <button className="profile-back link-btn" onClick={()=>go('/profile')}>‹ Profile</button>
    <div className="section-head"><div><span className="eyebrow">VIP profile</span><h1>Birthday & VIP rewards</h1><p>Save your birthday so the store can evaluate birthday-based VIP voucher or gift benefits when they are configured.</p></div></div>
    {error&&<div className="form-error">{error}</div>}
    <div className="form-card personal-info-card">
      <div className="avatar-editor"><span className="profile-menu-icon"><Icon name="gift" size={24}/></span><div><strong>Birthday eligibility</strong><small>Your birthday is profile data only. Saving it does not issue, reserve, or guarantee a reward.</small></div></div>
      <form onSubmit={save} className="profile-personal-form">
        <label>Date of birth<input type="date" min="1900-01-01" max={today} value={birthDate} onChange={event=>setBirthDate(event.target.value)}/><small>Birthday rewards apply only when the merchant enables VIP recurring issuance and configures an eligible BIRTHDAY voucher or gift for your current tier.</small></label>
        <div className="readonly-field"><Icon name="shield" size={15}/><span>Reward eligibility and issuance are decided securely by the store backend.</span></div>
        <div className="address-actions"><button className="btn btn-primary" disabled={busy}>{busy?'Saving…':'Save birthday'}</button>{birthDate&&<button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>setBirthDate('')}>Clear date</button>}</div>
      </form>
    </div>
    <Toast message={toast} onClose={()=>setToast('')}/>
  </section>;
}
