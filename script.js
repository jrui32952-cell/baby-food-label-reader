const barcodeInput = document.querySelector('#barcode');
const status = document.querySelector('#status');
const result = document.querySelector('#result');

if (barcodeInput) {
  document.querySelector('#search-form').addEventListener('submit', event => {
    const barcode = barcodeInput.value.trim();
    if (!/^\d{8,14}$/.test(barcode)) {
      event.preventDefault();
      barcodeInput.setCustomValidity('Enter an 8 to 14 digit barcode.');
      barcodeInput.reportValidity();
    }
  });
  barcodeInput.addEventListener('input', () => barcodeInput.setCustomValidity(''));
}

const setText = (selector, value) => {
  document.querySelector(selector).textContent = value || 'Not recorded';
};

function renderPackagingImage(product) {
  const container = document.querySelector('#image-container');
  const dialog = document.querySelector('#image-dialog');
  const enlarged = document.querySelector('#enlarged-image-container');
  const close = document.querySelector('#close-image');
  container.replaceChildren();
  const url = product.image_front_url || product.image_url;
  if (!url) {
    container.textContent = 'Product image unavailable';
    return;
  }
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'image-trigger';
  trigger.disabled = true;
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'image-dialog');
  trigger.setAttribute('aria-label', `Enlarge packaging image for ${product.product_name || 'this product'}`);
  const img = document.createElement('img');
  img.alt = `Packaging for ${product.product_name || 'this product'}`;
  const hint = document.createElement('span');
  hint.className = 'image-hint';
  hint.textContent = '＋ Click to enlarge';
  hint.hidden = true;
  img.onload = () => { trigger.disabled = false; hint.hidden = false; };
  img.onerror = () => { container.textContent = 'Product image unavailable'; };
  img.src = url;
  trigger.append(img, hint);
  container.append(trigger);
  trigger.addEventListener('click', () => {
    if (trigger.disabled || dialog.open) return;
    enlarged.replaceChildren();
    const large = document.createElement('img');
    large.alt = img.alt;
    large.onerror = () => { enlarged.textContent = 'Product image unavailable'; };
    large.src = url;
    enlarged.append(large);
    dialog.showModal();
    document.body.classList.add('image-modal-open');
  });
  close.onclick = () => dialog.close();
  dialog.onclick = event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  };
  // Native dialog handles Escape and keeps keyboard focus inside the modal.
  dialog.onclose = () => {
    document.body.classList.remove('image-modal-open');
    enlarged.replaceChildren();
    if (trigger.isConnected && !trigger.disabled) trigger.focus({preventScroll: true});
  };
}

// Check explicit energy values on the same per-100-g basis; allow rounding differences.
function energyValuesConflict(values) {
  const keys = ['energy-kcal_100g', 'energy-kj_100g'];
  if (keys.some(key => values[key] === undefined || values[key] === null || values[key] === '' ||
      !Number.isFinite(Number(values[key])) || Number(values[key]) < 0)) return false;
  const expectedKj = Number(values[keys[0]]) * 4.184;
  const recordedKj = Number(values[keys[1]]);
  return Math.abs(expectedKj - recordedKj) > Math.max(5, 0.1 * Math.max(expectedKj, recordedKj));
}

function renderProduct(product, barcode) {
  setText('#product-name', product.product_name || product.product_name_en);
  setText('#brand', product.brands);
  setText('#product-code', barcode);
  setText('#quantity', product.quantity);
  document.querySelector('#source-link').href = `https://world.openfoodfacts.org/product/${encodeURIComponent(barcode)}`;
  document.title = `${product.product_name || 'Product'} · Baby Food Label Reader`;

  renderPackagingImage(product);

  const ingredients = product.ingredients_text || product.ingredients_text_en || '';
  document.querySelector('#ingredients').textContent = ingredients || 'Ingredient text not recorded. Check the physical package.';

  const tags = document.querySelector('#allergens');
  tags.replaceChildren();
  if (Array.isArray(product.allergens_tags) && product.allergens_tags.length) {
    for (const tag of product.allergens_tags) {
      const pill = document.createElement('span');
      pill.className = 'tag';
      pill.textContent = tag.replace(/^en:/, '').replaceAll('-', ' ');
      tags.append(pill);
    }
  } else {
    tags.textContent = 'No allergen information recorded. This does not mean allergen-free.';
  }

  const explanations = document.querySelector('#explanations');
  explanations.replaceChildren();
  const ingredientElement = document.querySelector('#ingredients');
  const clearButton = document.querySelector('#clear-highlight');
  const highlightStatus = document.querySelector('#highlight-status');
  function clearHighlight() {
    ingredientElement.textContent = ingredients || 'Ingredient text not recorded. Check the physical package.';
    clearButton.hidden = true;
    highlightStatus.textContent = '';
  }
  clearButton.onclick = clearHighlight;
  const notes = [
    [/\bcultured reduced fat milk\b/gi, 'Cultured reduced fat milk', 'A milk ingredient. “Cultured” refers to fermentation using microorganisms.', 'https://www.ecfr.gov/current/title-21/section-131.112', 'eCFR: Cultured milk'],
    [/\bnonfat dry milk\b/gi, 'Nonfat dry milk', 'Dried milk with most water removed and very little milk fat.', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-131/subpart-B/section-131.125', 'eCFR: Nonfat dry milk'],
    [/\bgelatin\b/gi, 'Gelatin', 'A protein made from animal collagen. The word alone does not identify the animal source.', 'https://www.gelatine.org/en/service/faq.html', 'Gelatine Manufacturers of Europe: FAQ'],
    [/\bcholine bitartrate\b/gi, 'Choline bitartrate', 'A form of choline, a nutrient. This name does not tell us how much choline the product provides.', 'https://ods.od.nih.gov/factsheets/Choline-HealthProfessional/', 'NIH: Choline'],
    [/\bmixed tocopherols\b/gi, 'Mixed tocopherols', 'A mixture of tocopherols, forms of vitamin E with antioxidant activity. Check the original text for any stated purpose in this product.', 'https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/', 'NIH: Vitamin E'],
    [/\bsunflower lecithin\b/gi, 'Sunflower lecithin', 'The ingredient name identifies sunflower as the source. Lecithin can act as an emulsifier, helping ingredients mix; its exact purpose here is not specified by the name alone.', 'https://hfpappexternal.fda.gov/scripts/fdcc/index.cfm?id=LECITHIN&set=FoodSubstances', 'FDA: Lecithin']
  ];
  for (const [pattern, term, explanation, sourceUrl, sourceName] of notes) {
    pattern.lastIndex = 0;
    if (!pattern.test(ingredients)) continue;
    const detail = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = term;
    const text = document.createElement('p');
    text.textContent = explanation;
    const find = document.createElement('button');
    find.type = 'button';
    find.className = 'text-button';
    find.textContent = 'Find in original text';
    find.addEventListener('click', () => {
      clearHighlight();
      ingredientElement.replaceChildren();
      pattern.lastIndex = 0;
      let match, offset = 0, count = 0, first;
      while ((match = pattern.exec(ingredients)) !== null) {
        ingredientElement.append(document.createTextNode(ingredients.slice(offset, match.index)));
        const mark = document.createElement('mark');
        mark.textContent = match[0];
        ingredientElement.append(mark);
        first ||= mark;
        offset = match.index + match[0].length;
        count++;
      }
      // Rebuild from safe text nodes; API text is never interpreted as HTML.
      if (count) {
        ingredientElement.append(document.createTextNode(ingredients.slice(offset)));
        clearButton.hidden = false;
        highlightStatus.textContent = `${count} matching occurrence${count === 1 ? '' : 's'} highlighted for ${term}.`;
        ingredientElement.focus({preventScroll: true});
        first.scrollIntoView({block: 'center', behavior: 'auto'});
      } else {
        ingredientElement.textContent = ingredients;
      }
    });
    const source = document.createElement('a');
    source.href = sourceUrl;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.className = 'explanation-source';
    source.textContent = `Explanation source: ${sourceName}`;
    detail.append(summary, text, find, source);
    explanations.append(detail);
  }
  if (!explanations.childElementCount) {
    const text = document.createElement('p');
    text.textContent = ingredients ? 'This website does not yet explain any terms in this ingredient list.' : 'No ingredient text available to explain.';
    explanations.append(text);
  }

  const nutrition = document.querySelector('#nutrition');
  nutrition.replaceChildren();
  const values = product.nutriments || {};
  for (const [label, key, unit] of [
    ['Energy', 'energy-kcal_100g', 'kcal'],
    ['Sugars', 'sugars_100g', 'g'],
    ['Proteins', 'proteins_100g', 'g']
  ]) {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    const amount = Number(values[key]);
    description.textContent = values[key] !== undefined && values[key] !== null && values[key] !== '' && Number.isFinite(amount)
      ? `${Number(amount.toFixed(1))} ${unit}` : 'Not recorded';
    row.append(term, description);
    nutrition.append(row);
  }
  const warning = document.querySelector('#nutrition-warning');
  warning.hidden = !energyValuesConflict(values);
  warning.textContent = warning.hidden ? '' :
    `Website check: Energy values in this record are inconsistent (${values['energy-kcal_100g']} kcal and ${values['energy-kj_100g']} kJ per 100 g). Source values are shown without correction. Check the package. This check only compares the two energy fields.`;
  result.hidden = false;
}

if (result) {
  const barcode = new URLSearchParams(window.location.search).get('barcode')?.trim() || '';
  if (!/^\d{8,14}$/.test(barcode)) {
    status.textContent = 'Enter a valid barcode on the search page.';
    status.classList.add('error');
  } else {
    (async () => {
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
        if (response.status === 404) {
          status.textContent = 'Product not found in Open Food Facts. Check the barcode or physical package.';
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status !== 1 || !data.product) {
          status.textContent = 'Product not found in Open Food Facts. Check the barcode or physical package.';
          return;
        }
        renderProduct(data.product, barcode);
        status.textContent = 'Product information loaded from Open Food Facts.';
        status.classList.add('visually-hidden');
      } catch (error) {
        status.classList.add('error');
        status.textContent = 'Could not load the product. Check your connection and try again.';
        console.error('Product lookup failed:', error);
      }
    })();
  }
}
