import React from'react';
import{OrderDetailPage}from'./OrderDetailPage.jsx';
import{DeliveryExperience}from'../components/DeliveryExperience.jsx';
export function OrderExperiencePage({orderRef}){return <><OrderDetailPage orderRef={orderRef}/><DeliveryExperience orderRef={orderRef}/></>}
