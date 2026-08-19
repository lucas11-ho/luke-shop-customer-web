let registrationPromise=null;

export function registerLukePwa({onUpdate}={}){
  if(typeof window==='undefined'||!('serviceWorker'in navigator))return Promise.resolve(null);
  if(registrationPromise)return registrationPromise;
  registrationPromise=navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(registration=>{
    const notify=worker=>{if(worker&&navigator.serviceWorker.controller)onUpdate?.(registration,worker)};
    if(registration.waiting)notify(registration.waiting);
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      if(!worker)return;
      worker.addEventListener('statechange',()=>{if(worker.state==='installed')notify(worker)});
    });
    return registration;
  }).catch(()=>null);
  return registrationPromise;
}

export function activateWaitingWorker(registration){
  registration?.waiting?.postMessage({type:'SKIP_WAITING'});
}
