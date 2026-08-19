function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function isModifierOptionEnabled(option) {
  if (!option) return false;
  if (option.enabled === false || option.is_active === false) return false;
  const status = String(option.status || '').toUpperCase();
  return !['DISABLED', 'INACTIVE', 'ARCHIVED', 'DELETED'].includes(status);
}

export function minSelections(group) {
  const configured = Math.max(0, toNumber(group?.min_selections, 0));
  return group?.required ? Math.max(1, configured) : configured;
}

export function maxSelections(group) {
  const explicit = toNumber(group?.max_selections, 0);
  const type = String(group?.selection_type || group?.type || '').toUpperCase();
  if (type === 'SINGLE' || type === 'RADIO') return 1;
  return explicit > 0 ? explicit : Infinity;
}

export function normalizeModifierGroups(groups = []) {
  return (Array.isArray(groups) ? groups : [])
    .filter((group) => group && group.public_id && group.enabled !== false && group.is_active !== false)
    .map((group) => ({
      ...group,
      options: (Array.isArray(group.options) ? group.options : []).filter(isModifierOptionEnabled),
    }));
}

export function sanitizeSelection(groups = [], selection = {}) {
  const next = {};
  for (const group of groups) {
    const allowed = new Map((group.options || []).map((option) => [option.public_id, option]));
    const seen = new Set();
    next[group.public_id] = (selection[group.public_id] || []).filter((option) => {
      const id = option?.public_id;
      if (!id || seen.has(id) || !allowed.has(id)) return false;
      seen.add(id);
      return true;
    }).map((option) => allowed.get(option.public_id));
  }
  return next;
}

export function validateModifierGroup(group, list = []) {
  const count = Array.isArray(list) ? list.length : 0;
  const min = minSelections(group);
  const max = maxSelections(group);
  if ((group.options || []).length < min) {
    return { valid: false, code: 'GROUP_CONFIGURATION_INVALID', message: `${group.name || 'This option group'} is temporarily unavailable.` };
  }
  if (count < min) {
    return { valid: false, code: 'MIN_SELECTIONS', message: min === 1 ? `Please choose 1 option from “${group.name}”.` : `Please choose at least ${min} options from “${group.name}”.` };
  }
  if (count > max) {
    return { valid: false, code: 'MAX_SELECTIONS', message: max === 1 ? `Please choose only 1 option from “${group.name}”.` : `Please choose no more than ${max} options from “${group.name}”.` };
  }
  return { valid: true, code: null, message: '' };
}

export function validateModifierSelection(groups = [], selection = {}) {
  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    const result = validateModifierGroup(group, selection[group.public_id] || []);
    if (!result.valid) return { ...result, group, index };
  }
  return { valid: true, group: null, index: -1, message: '' };
}

export function modifierOptionIds(groups = [], selection = {}) {
  const safe = sanitizeSelection(groups, selection);
  return groups.flatMap((group) => (safe[group.public_id] || []).map((option) => option.public_id));
}

export function modifierErrorMessage(error, groups = [], selection = {}) {
  const local = validateModifierSelection(groups, selection);
  if (!local.valid) return local.message;
  const detailName = error?.details?.group_name || error?.details?.modifier_group_name;
  if (detailName) return `Please review your choices for “${detailName}”.`;
  return 'Please review the required product options and try again.';
}

export function productExplicitlyHasModifiers(product) {
  if (!product) return false;
  if (product.has_modifier_groups === true || product.has_modifiers === true || product.requires_modifiers === true) return true;
  return toNumber(product.modifier_group_count, 0) > 0;
}

export function productExplicitlyHasNoModifiers(product) {
  if (!product) return false;
  if (product.has_modifier_groups === false || product.has_modifiers === false || product.requires_modifiers === false) return true;
  if (Object.prototype.hasOwnProperty.call(product, 'modifier_group_count')) return toNumber(product.modifier_group_count, 0) === 0;
  return false;
}
