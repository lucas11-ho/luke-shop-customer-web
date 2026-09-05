import React from 'react';
import {
  BasketIcon,BellIcon,ClipboardTextIcon,CompassIcon,GiftIcon,HandbagIcon,HeartIcon,HouseIcon,ListChecksIcon,
  MagnifyingGlassIcon,MapPinIcon,PackageIcon,ReceiptIcon,ShoppingBagIcon,SquaresFourIcon,StarIcon,StorefrontIcon,
  TagIcon,UserCircleIcon,UserIcon,
} from '@phosphor-icons/react';
import { Icon } from './icons.jsx';

const PHOSPHOR={
  house:HouseIcon,
  storefront:StorefrontIcon,
  'squares-four':SquaresFourIcon,
  'shopping-bag':ShoppingBagIcon,
  basket:BasketIcon,
  handbag:HandbagIcon,
  receipt:ReceiptIcon,
  'clipboard-text':ClipboardTextIcon,
  package:PackageIcon,
  'list-checks':ListChecksIcon,
  'user-circle':UserCircleIcon,
  user:UserIcon,
  heart:HeartIcon,
  star:StarIcon,
  compass:CompassIcon,
  'magnifying-glass':MagnifyingGlassIcon,
  tag:TagIcon,
  gift:GiftIcon,
  bell:BellIcon,
  'map-pin':MapPinIcon,
};

export const PHOSPHOR_NAV_ICON_KEYS=Object.freeze(Object.keys(PHOSPHOR));

export function ThemeNavIcon({name,size=24,variant='outline',pack='LUKE_OUTLINE'}){
  if(pack==='PHOSPHOR_NAV'){
    const Component=PHOSPHOR[name]||HouseIcon;
    const weight=variant==='filled'?'fill':variant==='duotone'?'duotone':'regular';
    return <Component className="theme-nav-phosphor" size={size} weight={weight} aria-hidden="true"/>;
  }
  return <Icon name={name} size={size}/>;
}
