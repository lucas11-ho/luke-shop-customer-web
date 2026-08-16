import React, { useEffect, useMemo, useState } from 'react';
import { money } from './UI.jsx';
import { Icon } from './icons.jsx';

// Guided "build your meal" flow over the EXISTING Luke Shop modifier groups/options.
// No new APIs: it only assembles modifier_option_ids for the existing cart contract.

function required(group) { return Boolean(group.required) || Number(group.min_selections) > 0; }
function minFor(group) { return required(group) ? Math.max(1, Number(group.min_selections) || 1) : Number(group.min_selections) || 0; }
function isGroupValid(group, list) {
  const n = list.length;
  const min = minFor(group);
  const max = group.max_selections ? Number(group.max_selections) : Infinity;
  return n >= min && n <= max;
}

export function ComboBuilder({ open, onClose, product, groups, currency, locale, unitBase = 0, quantity = 1, initialSelection = {}, onConfirm }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState(initialSelection);

  useEffect(() => { if (open) { setStep(0); setSel(initialSelection); } }, [open]);
  if (!open || !groups?.length) return null;

  const group = groups[step];
  const list = sel[group.public_id] || [];
  const single = group.max_selections === 1;

  const toggle = (opt) => {
    setSel((cur) => {
      const cl = cur[group.public_id] || [];
      const exists = cl.some((x) => x.public_id === opt.public_id);
      if (exists) return { ...cur, [group.public_id]: cl.filter((x) => x.public_id !== opt.public_id) };
      if (single) return { ...cur, [group.public_id]: [opt] };
      if (group.max_selections && cl.length >= group.max_selections) return cur;
      return { ...cur, [group.public_id]: [...cl, opt] };
    });
  };

  const allOptions = useMemo(() => Object.values(sel).flat(), [sel]);
  const itemTotal = Number(unitBase) + allOptions.reduce((s, o) => s + Number(o.price_delta || 0), 0);
  const stepValid = isGroupValid(group, list);
  const firstInvalid = groups.findIndex((g) => !isGroupValid(g, sel[g.public_id] || []));
  const allValid = firstInvalid === -1;
  const isLast = step === groups.length - 1;

  const hint = single ? 'Choose 1' : `${required(group) ? 'Choose' : 'Add up to'} ${minFor(group) || 0}${group.max_selections ? `–${group.max_selections}` : '+'}`;

  const confirm = () => { if (!allValid) { setStep(firstInvalid); return; } onConfirm(sel, allOptions.map((o) => o.public_id)); onClose(); };
  const next = () => { if (!stepValid) return; if (isLast) confirm(); else setStep((s) => Math.min(groups.length - 1, s + 1)); };

  return (
    <div className="combo-overlay" role="dialog" aria-modal="true" aria-label="Build your meal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="combo-panel" data-testid="combo-builder">
        <div className="combo-head">
          <div>
            <span className="eyebrow">Build your meal · Step {step + 1} of {groups.length}</span>
            <h2>{product?.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close builder"><Icon name="x" size={20} /></button>
        </div>

        <div className="combo-steps" aria-hidden="true">
          {groups.map((g, i) => {
            const done = isGroupValid(g, sel[g.public_id] || []);
            return <button key={g.public_id} type="button" className={`combo-step-dot ${i === step ? 'is-current' : ''} ${done ? 'is-done' : ''}`} onClick={() => setStep(i)} title={g.name}>{done && i !== step ? <Icon name="check" size={12} /> : i + 1}</button>;
          })}
        </div>

        <div className="combo-body">
          <div className="modifier-group-head">
            <label>{group.name}</label>
            {required(group) ? <span className="required">Required</span> : <span className="modifier-optional">Optional</span>}
            <small className="modifier-count">{list.length > 0 ? `${list.length} selected` : hint}</small>
          </div>
          <div className="modifier-list modifier-list-v2" role={single ? 'radiogroup' : 'group'} aria-label={group.name}>
            {group.options.map((o) => {
              const active = list.some((x) => x.public_id === o.public_id);
              const full = !single && group.max_selections && list.length >= group.max_selections;
              const disabled = !active && full;
              const delta = Number(o.price_delta);
              return (
                <button key={o.public_id} type="button" role={single ? 'radio' : 'checkbox'} aria-checked={active} disabled={disabled} className={`modifier-option ${active ? 'selected' : ''} ${disabled ? 'is-disabled' : ''}`} onClick={() => toggle(o)} data-testid="combo-option">
                  <span className={`modifier-mark ${single ? 'is-radio' : 'is-check'}`}>{active && <Icon name="check" size={13} />}</span>
                  <span className="modifier-name">{o.name}</span>
                  <span className="modifier-price">{delta ? `+ ${money(o.price_delta, currency, locale)}` : 'Included'}</span>
                </button>
              );
            })}
          </div>
          {required(group) && !stepValid && <p className="combo-validation"><Icon name="info" size={14} /> Please choose {minFor(group)} to continue.</p>}
        </div>

        <div className="combo-footer">
          <div className="combo-total"><span>Item total</span><strong>{money(itemTotal, currency, locale)}{quantity > 1 ? ` × ${quantity}` : ''}</strong></div>
          <div className="combo-actions">
            {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}><Icon name="chevron-right" size={16} className="flip" /> Back</button>}
            <button type="button" className="btn btn-primary" disabled={!stepValid} onClick={next} data-testid="combo-next">
              {isLast ? <>Add to cart · {money(itemTotal * quantity, currency, locale)}</> : <>Next <Icon name="arrow-right" size={16} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
