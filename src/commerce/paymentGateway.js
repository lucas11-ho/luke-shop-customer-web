const TOKENPAY='TOKENPAY';

export function isTokenPayMethod(method){
  return String(method?.provider_type||'').toUpperCase()==='EXTERNAL'&&String(method?.provider_key||'').toUpperCase()===TOKENPAY;
}

export function isTokenPayPayment(payment){
  return String(payment?.provider_type||'').toUpperCase()==='EXTERNAL'&&String(payment?.provider_key||'').toUpperCase()===TOKENPAY;
}

export function paymentSessionKey(prefix='payment'){
  return `${prefix}-${Date.now()}-${crypto.randomUUID()}`;
}

export async function createHostedPaymentSession(api,orderRef,{prefix='payment'}={}){
  const response=await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}/payment/session`,{
    method:'POST',auth:true,body:{idempotency_key:paymentSessionKey(prefix)},
  });
  return response?.data?.payment_session||null;
}

export function trustedHostedPaymentUrl(session){
  if(session?.action!=='REDIRECT'||!session?.url)return'';
  try{
    const url=new URL(String(session.url));
    return url.protocol==='https:'?url.toString():'';
  }catch{return'';}
}

export function redirectToHostedPayment(session){
  const url=trustedHostedPaymentUrl(session);
  if(!url)throw new Error('Secure payment page is unavailable. Open your order and try payment again.');
  window.location.assign(url);
}
