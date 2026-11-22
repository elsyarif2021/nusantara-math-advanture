import React from 'react';import {createRoot} from 'react-dom/client';import App from './App';import './index.css';createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);if('serviceWorker'in navigator){
 let refreshing=false;
 const hadController=Boolean(navigator.serviceWorker.controller);
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(!hadController||refreshing)return;
  refreshing=true;
  window.location.reload();
 });
 window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));
}