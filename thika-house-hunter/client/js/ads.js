const AD_API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api';
let automaticAdConfigPromise = null;
let adsenseScriptPromise = null;

function escapeAdText(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeAdUrl(value = '') {
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch (error) {
    return '';
  }
}

function adInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';
}

function adCardTemplate(ad) {
  const targetUrl = safeAdUrl(ad.target_url);
  const imageUrl = safeAdUrl(ad.image_url);
  const title = escapeAdText(ad.title);
  const advertiser = escapeAdText(ad.advertiser_name);
  const description = escapeAdText(ad.description || '');
  const cta = escapeAdText(ad.cta_label || 'Learn more');

  return `
    <article class="tenant-ad-card">
      <a href="${targetUrl}" class="tenant-ad-link" target="_blank" rel="sponsored noopener noreferrer" data-ad-id="${ad.id}">
        <div class="tenant-ad-media">
          ${imageUrl ? `<img src="${imageUrl}" alt="${title}" />` : `<span>${escapeAdText(adInitials(ad.advertiser_name))}</span>`}
        </div>
        <div class="tenant-ad-body">
          <span class="tenant-ad-label">Sponsored</span>
          <h3>${title}</h3>
          <p>${description}</p>
          <div class="tenant-ad-footer">
            <span>${advertiser}</span>
            <strong>${cta}</strong>
          </div>
        </div>
      </a>
    </article>
  `;
}

function trackAdEvent(adId, eventName) {
  if (!adId) return;
  const url = `${AD_API_BASE}/ads/${encodeURIComponent(adId)}/${eventName}`;

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob(['{}'], { type: 'application/json' }));
    return;
  }

  fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
}

async function getAutomaticAdConfig() {
  if (!automaticAdConfigPromise) {
    automaticAdConfigPromise = fetch(`${AD_API_BASE}/ads/config`)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
  }

  return automaticAdConfigPromise;
}

function loadAdsenseScript(client) {
  if (!client) return Promise.resolve(false);
  if (adsenseScriptPromise) return adsenseScriptPromise;

  adsenseScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[data-thika-adsense="true"]');
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.thikaAdsense = 'true';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return adsenseScriptPromise;
}

async function enableAdsenseAutoAds() {
  const config = await getAutomaticAdConfig();
  const client = config?.adsense?.client;

  if (!config?.enabled || !config.adsense?.auto_ads || !client) return false;
  return loadAdsenseScript(client);
}

async function renderAdsenseSlot(slot) {
  const placement = slot.dataset.adPlacement;
  const config = await getAutomaticAdConfig();
  const adsense = config?.adsense;
  const client = adsense?.client;
  const adSlot = adsense?.slots?.[placement];

  if (!config?.enabled || !client || !adSlot) {
    slot.hidden = true;
    return false;
  }

  const scriptLoaded = await loadAdsenseScript(client);
  if (!scriptLoaded) {
    slot.hidden = true;
    return false;
  }

  slot.hidden = false;
  slot.innerHTML = `
    <ins class="adsbygoogle tenant-adsense-unit"
      style="display:block"
      data-ad-client="${escapeAdText(client)}"
      data-ad-slot="${escapeAdText(adSlot)}"
      data-ad-format="auto"
      data-full-width-responsive="true"${adsense.test_mode ? ' data-adtest="on"' : ''}></ins>
  `;

  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
    return true;
  } catch (error) {
    slot.hidden = true;
    return false;
  }
}

async function loadTenantAdSlot(slot) {
  const placement = slot.dataset.adPlacement;
  const limit = slot.dataset.adLimit || '1';
  if (!placement) return;

  try {
    const params = new URLSearchParams({ placement, limit });
    const response = await fetch(`${AD_API_BASE}/ads?${params.toString()}`);
    if (!response.ok) throw new Error('Ads unavailable');
    const data = await response.json();
    const ads = data.ads || [];

    if (!ads.length) {
      await renderAdsenseSlot(slot);
      return;
    }

    slot.hidden = false;
    slot.innerHTML = `<div class="tenant-ad-grid">${ads.map(adCardTemplate).join('')}</div>`;
    ads.forEach((ad) => trackAdEvent(ad.id, 'impression'));
  } catch (error) {
    await renderAdsenseSlot(slot);
  }
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-ad-id]');
  if (link) trackAdEvent(link.dataset.adId, 'click');
});

document.addEventListener('DOMContentLoaded', () => {
  enableAdsenseAutoAds();
  document.querySelectorAll('[data-ad-placement]').forEach(loadTenantAdSlot);
});
