const CART_LAYOUTS=new Set(['standard','compact','spacious']);
const CART_ITEM_STYLES=new Set(['cards','rows','minimal']);
const CART_SUMMARY_STYLES=new Set(['sticky','standard','inline']);
const CART_EMPTY_STYLES=new Set(['standard','minimal']);
const CHECKOUT_LAYOUTS=new Set(['standard','focused','compact']);
const CHECKOUT_SUMMARY_STYLES=new Set(['sticky','standard','inline']);
const CHECKOUT_SECTION_STYLES=new Set(['cards','compact','outlined']);
const CHECKOUT_SAVED_ADDRESS_STYLES=new Set(['cards','compact']);

export const CART_EXPERIENCE_DEFAULTS={layout:'standard',item_style:'cards',summary_style:'sticky',empty_style:'standard',show_continue_shopping:true,show_item_count:true,show_fulfillment:true,show_modifiers:true,show_delivery_hint:true,show_assurance:true};
export const CHECKOUT_EXPERIENCE_DEFAULTS={layout:'standard',summary_style:'sticky',section_style:'cards',saved_address_style:'cards',show_section_descriptions:true,show_promotion_code:true,show_order_note:true,show_support:true,show_trust:true};

export function resolveCartExperience(experience){const source=experience?.cart||{};return{layout:CART_LAYOUTS.has(source.layout)?source.layout:CART_EXPERIENCE_DEFAULTS.layout,item_style:CART_ITEM_STYLES.has(source.item_style)?source.item_style:CART_EXPERIENCE_DEFAULTS.item_style,summary_style:CART_SUMMARY_STYLES.has(source.summary_style)?source.summary_style:CART_EXPERIENCE_DEFAULTS.summary_style,empty_style:CART_EMPTY_STYLES.has(source.empty_style)?source.empty_style:CART_EXPERIENCE_DEFAULTS.empty_style,show_continue_shopping:source.show_continue_shopping!==false,show_item_count:source.show_item_count!==false,show_fulfillment:source.show_fulfillment!==false,show_modifiers:source.show_modifiers!==false,show_delivery_hint:source.show_delivery_hint!==false,show_assurance:source.show_assurance!==false};}
export function resolveCheckoutExperience(experience){const source=experience?.checkout||{};return{layout:CHECKOUT_LAYOUTS.has(source.layout)?source.layout:CHECKOUT_EXPERIENCE_DEFAULTS.layout,summary_style:CHECKOUT_SUMMARY_STYLES.has(source.summary_style)?source.summary_style:CHECKOUT_EXPERIENCE_DEFAULTS.summary_style,section_style:CHECKOUT_SECTION_STYLES.has(source.section_style)?source.section_style:CHECKOUT_EXPERIENCE_DEFAULTS.section_style,saved_address_style:CHECKOUT_SAVED_ADDRESS_STYLES.has(source.saved_address_style)?source.saved_address_style:CHECKOUT_EXPERIENCE_DEFAULTS.saved_address_style,show_section_descriptions:source.show_section_descriptions!==false,show_promotion_code:source.show_promotion_code!==false,show_order_note:source.show_order_note!==false,show_support:source.show_support!==false,show_trust:source.show_trust!==false};}
