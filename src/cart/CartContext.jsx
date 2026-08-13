import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {useAuth} from '../auth/AuthContext.jsx';
const CartContext=createContext(null);
export function CartProvider({children}){
  const{api,isAuthenticated,session}=useAuth();const[cart,setCart]=useState(null);const[loading,setLoading]=useState(false);
  const refresh=async()=>{if(!isAuthenticated){setCart(null);return null;}setLoading(true);try{const d=await api.request('/v1/customer/cart',{auth:true});setCart(d.data.cart);return d.data.cart;}catch(e){if(e.status===401)setCart(null);throw e;}finally{setLoading(false);}};
  useEffect(()=>{if(isAuthenticated)refresh().catch(()=>{});else setCart(null);},[isAuthenticated,session?.accessToken]);
  const itemCount=useMemo(()=>cart?.items?.reduce((sum,item)=>sum+Number(item.quantity||0),0)||0,[cart]);
  const addItem=async(body)=>{const d=await api.request('/v1/customer/cart/items',{method:'POST',body,auth:true});setCart(d.data.cart);return d.data.cart;};
  const updateItem=async(itemId,quantity)=>{const d=await api.request(`/v1/customer/cart/items/${encodeURIComponent(itemId)}`,{method:'PATCH',body:{quantity},auth:true});setCart(d.data.cart);return d.data.cart;};
  const removeItem=async(itemId)=>{const d=await api.request(`/v1/customer/cart/items/${encodeURIComponent(itemId)}`,{method:'DELETE',auth:true});setCart(d.data.cart);return d.data.cart;};
  return <CartContext.Provider value={{cart,itemCount,loading,refresh,addItem,updateItem,removeItem,setCart}}>{children}</CartContext.Provider>;
}
export function useCart(){return useContext(CartContext);}
