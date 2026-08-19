import React, { useEffect, useMemo, useState } from 'react';
import { money } from './UI.jsx';
import { Icon } from './icons.jsx';
import { maxSelections, minSelections, modifierOptionIds, sanitizeSelection, validateModifierGroup, validateModifierSelection } from '../modifiers/modifierRules.js';
// Shared rules preserve the backend min_selections / max_selections modifier contract.

export function ComboBuilder({ open, onClose, product, groups, currency, locale, unitBase = 0, quantity = 1, initialSelection = {}, onConfirm }) {
  const safeGroups = useMemo(() => groups || [], [groups]);
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState(() => sanitizeSelection(safeGroups, initialSelection));

  useEffect(() => {
    if (!open) return;
    const safe = sanitizeSelection(safeGroups, initialSelection);
    setSel(safe);
    const firstInvalid = validateModifierSelection(safeGroups, safe).index;
    setStep(firstInvalid >= 0 ? firstInvalid : 0);
  }, [open, safeGroups, initialSelection]);

  const allOptions = useMemo(() => Object.values(sel).flat(), [sel]);

  if (!open || !safeGroups.length) return null;
  const group = safeGroups[step];
  const list = sel[group.public_id] || [];
  const max = maxSelections(group);
  const min = minSelections(group);
  const single = max === 1;
  const groupValidation = validateModifierGroup(group, list);
  const overallValidation = validateModifierSelection(safeGroups, sel);

  const toggle = (option) => {
    setSel((current) => {
      const existing = current[group.public_id] || [];
      const active = existing.some((item) => item.public_id === option.public_id);
      if (active) return { ...current, [group.public_id]: existing.filter((item) => item.public_id !== option.public_id) };
      if (single) return { ...current, [group.public_id]: [option] };
      if (Number.isFinite(max) && existing.length >= max) return current;
      return { ...current, [group.public_id]: [...existing, option] };
    });
  };

  const itemTotal = Number(unitBase) + allOptions.reduce((sum, option) => sum + Number(option.price_delta || 0), 0);
  const isLast = step === safeGroups.length - 1;
  const hint = single
    ? (min > 0 ? 'Choose 1' : 'Choose up to 1')
    : Number.isFinite(max)
      ? (min > 0 ? `Choose ${min}${max !== min ? `–${max}` : ''}` : `Add up to ${max}`)
      : (min > 0 ? `Choose at least ${min}` : 'Optional');

  const confirm = () => {
    const result = validateModifierSelection(safeGroups, sel);
    if (!result.valid) { setStep(result.index); return; }
    onConfirm?.(sanitizeSelection(safeGroups, sel), modifierOptionIds(safeGroups, sel));
    onClose?.();
  };
  const next = () => {
    if (!groupValidation.valid) return;
    if (isLast) confirm(); else setStep((value) => Math.min(safeGroups.length - 1, value + 1));
  };

  return (
    <div className="combo-overlay" role="dialog" aria-modal="true" aria-label="Choose product options" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="combo-panel" data-testid="combo-builder">
        <div className="combo-head">
          <div>
            <span className="eyebrow">Customize · Step {step + 1} of {safeGroups.length}</span>
            <h2>{product?.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close options"><Icon name="x" size={20} /></button>
        </div>

        <div className="combo-steps" aria-label="Option groups">
          {safeGroups.map((item, index) => {
            const done = validateModifierGroup(item, sel[item.public_id] || []).valid;
            return <button key={item.public_id} type="button" className={`combo-step-dot ${index === step ? 'is-current' : ''} ${done ? 'is-done' : ''}`} onClick={() => setStep(index)} title={item.name}>{done && index !== step ? <Icon name="check" size={12} /> : index + 1}</button>;
          })}
        </div>

        <div className="combo-body">
          <div className="modifier-group-head">
            <label>{group.name}</label>
            {min > 0 ? <span className="required">Required</span> : <span className="modifier-optional">Optional</span>}
            <small className="modifier-count">{list.length > 0 ? `${list.length} selected` : hint}</small>
          </div>
          <div className="modifier-list modifier-list-v2" role={single ? 'radiogroup' : 'group'} aria-label={group.name}>
            {(group.options || []).map((option) => {
              const active = list.some((item) => item.public_id === option.public_id);
              const full = !single && Number.isFinite(max) && list.length >= max;
              const disabled = !active && full;
              const delta = Number(option.price_delta || 0);
              return (
                <button key={option.public_id} type="button" role={single ? 'radio' : 'checkbox'} aria-checked={active} disabled={disabled} className={`modifier-option ${active ? 'selected' : ''} ${disabled ? 'is-disabled' : ''}`} onClick={() => toggle(option)} data-testid="combo-option">
                  <span className={`modifier-mark ${single ? 'is-radio' : 'is-check'}`}>{active && <Icon name="check" size={13} />}</span>
                  <span className="modifier-name">{option.name}</span>
                  <span className="modifier-price">{delta ? `+ ${money(delta, currency, locale)}` : 'Included'}</span>
                </button>
              );
            })}
          </div>
          {!groupValidation.valid && <p className="combo-validation" role="alert"><Icon name="info" size={14} /> {groupValidation.message}</p>}
          {!group.options?.length && <p className="combo-validation" role="alert"><Icon name="alert-triangle" size={14} /> This option group has no available choices. Please contact the store.</p>}
        </div>

        <div className="combo-footer">
          <div className="combo-total"><span>Item total</span><strong>{money(itemTotal, currency, locale)}{quantity > 1 ? ` × ${quantity}` : ''}</strong></div>
          <div className="combo-actions">
            {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep((value) => value - 1)}><Icon name="chevron-right" size={16} className="flip" /> Back</button>}
            <button type="button" className="btn btn-primary" disabled={!groupValidation.valid} onClick={next} data-testid="combo-next">
              {isLast ? <>Add to cart · {money(itemTotal * quantity, currency, locale)}</> : <>Next <Icon name="arrow-right" size={16} /></>}
            </button>
          </div>
          {!overallValidation.valid && overallValidation.index !== step && <small className="combo-footer-warning">Another required group still needs a selection.</small>}
        </div>
      </div>
    </div>
  );
}
