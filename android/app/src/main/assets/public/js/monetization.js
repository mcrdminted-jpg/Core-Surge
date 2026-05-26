// ============================================================
// monetization.js -- native App Store / Play Store billing via
// Capacitor + RevenueCat, with a safe web fallback.
// ============================================================

const MONETIZATION_CONFIG_STORAGE_KEY = 'core_surge_revenuecat_config_v1';
const MONETIZATION_RECEIPT_LEDGER_KEY = 'core_surge_store_receipts_v1';
const RC_PRODUCT_CATEGORY_NON_SUBSCRIPTION = 'NON_SUBSCRIPTION';
const RC_PRODUCT_CATEGORY_SUBSCRIPTION = 'SUBSCRIPTION';

const monetizationState = {
  initialized: false,
  platform: 'web',
  purchaseLayer: 'RevenueCat',
  status: 'Web preview mode. Store billing is available in native App Store and Play builds.',
  config: null,
  pluginAvailable: false,
  configured: false,
  configuredAppUserId: null,
  productsByCatalogId: {},
  productsByStoreId: {},
  customerInfo: null,
  receiptLedger: loadReceiptLedger(),
  isLoadingProducts: false,
  isPurchasing: false,
  isRestoring: false,
  lastError: ''
};

function defaultMonetizationConfig() {
  return {
    appleApiKey: '',
    googleApiKey: '',
    entitlementMap: {
      starter_pack: 'starter_pack',
      gem_pack_small: '',
      gem_pack_medium: '',
      monthly_vault: 'monthly_vault'
    }
  };
}

function loadMonetizationConfig() {
  try {
    const raw = localStorage.getItem(MONETIZATION_CONFIG_STORAGE_KEY);
    if (!raw) return defaultMonetizationConfig();
    return { ...defaultMonetizationConfig(), ...JSON.parse(raw) };
  } catch (_error) {
    return defaultMonetizationConfig();
  }
}

function saveMonetizationConfig(rawInput) {
  const parsed = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  const normalized = { ...defaultMonetizationConfig(), ...(parsed || {}) };
  localStorage.setItem(MONETIZATION_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  monetizationState.config = normalized;
  monetizationState.initialized = false;
  monetizationState.configured = false;
  monetizationState.configuredAppUserId = null;
  void initMonetization({ force: true });
}

function loadReceiptLedger() {
  try {
    const raw = localStorage.getItem(MONETIZATION_RECEIPT_LEDGER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_error) {
    return {};
  }
}

function persistReceiptLedger() {
  localStorage.setItem(MONETIZATION_RECEIPT_LEDGER_KEY, JSON.stringify(monetizationState.receiptLedger));
}

function detectMonetizationPlatform() {
  const cap = window.Capacitor;
  if (!cap) return 'web';
  try {
    const platform = typeof cap.getPlatform === 'function' ? cap.getPlatform() : 'web';
    return platform || 'web';
  } catch (_error) {
    return 'web';
  }
}

function getPurchasesPlugin() {
  const cap = window.Capacitor;
  if (!cap || !cap.Plugins || monetizationState.platform === 'web') return null;
  return cap.Plugins.Purchases || null;
}

function getRevenueCatApiKeyForPlatform() {
  const config = monetizationState.config || loadMonetizationConfig();
  if (monetizationState.platform === 'ios') return (config.appleApiKey || '').trim();
  if (monetizationState.platform === 'android') return (config.googleApiKey || '').trim();
  return '';
}

function monetizationAppUserId() {
  if (typeof cloudState !== 'undefined' && cloudState && cloudState.user && cloudState.user.uid) {
    return cloudState.user.uid;
  }
  if (save && save.playerId) return save.playerId;
  if (save && save.username) return save.username;
  return 'local-player';
}

function currentStoreProductId(product) {
  if (!product) return '';
  return monetizationState.platform === 'android' ? product.googleProductId : product.appleProductId;
}

function isSubscriptionProduct(product) {
  return !!(product && product.rewards && product.rewards.monthlyPass);
}

function loadCatalogItemForStoreId(storeId) {
  return STORE_PRODUCT_CATALOG.find((item) => {
    return item.appleProductId === storeId || item.googleProductId === storeId;
  }) || null;
}

function productOwnershipLedgerKey(productId) {
  return `owned:${monetizationAppUserId()}:${productId}`;
}

function transactionLedgerKey(productId, transactionId) {
  return `tx:${monetizationAppUserId()}:${productId}:${transactionId || 'unknown'}`;
}

function receiptLedgerHas(key) {
  return !!monetizationState.receiptLedger[key];
}

function markReceiptLedger(key) {
  monetizationState.receiptLedger[key] = Date.now();
  persistReceiptLedger();
}

function storeUiRefresh() {
  if (typeof renderSubmenu === 'function') renderSubmenu();
  if (typeof renderMenu === 'function') renderMenu();
  if (typeof renderHud === 'function') renderHud();
}

function setMonetizationStatus(note, errorText) {
  monetizationState.status = note;
  monetizationState.lastError = errorText || '';
  storeUiRefresh();
}

function purchasePlatformLabel() {
  if (!monetizationState.initialized) {
    monetizationState.platform = detectMonetizationPlatform();
  }
  if (monetizationState.platform === 'ios') return 'Apple App Store';
  if (monetizationState.platform === 'android') return 'Google Play';
  return 'Web Preview';
}

function monetizationStatusText() {
  return monetizationState.lastError
    ? `${monetizationState.status} ${monetizationState.lastError}`
    : monetizationState.status;
}

function isNativeStoreBuild() {
  if (!monetizationState.initialized) {
    monetizationState.platform = detectMonetizationPlatform();
  }
  return monetizationState.platform === 'ios' || monetizationState.platform === 'android';
}

function rewardSummaryForProduct(product) {
  if (!product || !product.rewards) return '';
  const parts = [];
  if (product.rewards.gems) parts.push(`+${product.rewards.gems} gems`);
  if (product.rewards.coins) parts.push(`+${product.rewards.coins} coins`);
  if (product.rewards.unlockCards && product.rewards.unlockCards.length) parts.push('starter card unlock');
  if (product.rewards.monthlyPass) parts.push('monthly pass access');
  return parts.join(' | ');
}

function displayStorePrice(product) {
  const storeProduct = monetizationState.productsByCatalogId[product.id];
  return storeProduct && storeProduct.priceString ? storeProduct.priceString : product.priceLabel;
}

function nativeStoreAvailabilityLabel(product) {
  if (!isNativeStoreBuild()) return 'Native build only';
  if (!monetizationState.pluginAvailable) return 'Capacitor bridge not ready';
  if (!monetizationState.configured) return 'RevenueCat key needed';
  if (monetizationState.productsByCatalogId[product.id]) return purchasePlatformLabel();
  return 'Store product not loaded yet';
}

function storePurchaseButtonLabel(product) {
  if (!isNativeStoreBuild()) return 'Prepare Native Purchase';
  if (monetizationState.isPurchasing) return 'Processing Purchase';
  if (!monetizationState.configured) return 'Finish Billing Setup';
  if (!monetizationState.productsByCatalogId[product.id]) return 'Sync Store Product';
  return 'Buy Now';
}

function canPurchaseStoreProduct(product) {
  if (!product) return false;
  return isNativeStoreBuild()
    && monetizationState.pluginAvailable
    && monetizationState.configured
    && !!monetizationState.productsByCatalogId[product.id]
    && !monetizationState.isPurchasing;
}

function grantProductRewardsLocally(productId) {
  const product = STORE_PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return false;
  const rewards = product.rewards || {};
  if (rewards.gems) save.gems += rewards.gems;
  if (rewards.coins) save.coins += rewards.coins;
  if (Array.isArray(rewards.unlockCards)) {
    for (const cardId of rewards.unlockCards) {
      if (!save.cardInventory[cardId]) save.cardInventory[cardId] = { level: 1, copies: 1 };
    }
  }
  if (rewards.monthlyPass) save.monthlyVaultActive = true;
  persistSave();
  if (typeof scheduleCloudSync === 'function') scheduleCloudSync();
  return true;
}

function syncEntitlementsFromCustomerInfo(customerInfo) {
  const active = (customerInfo && customerInfo.entitlements && customerInfo.entitlements.active) || {};
  const entitlementMap = (monetizationState.config && monetizationState.config.entitlementMap) || {};
  const monthlyEntitlement = entitlementMap.monthly_vault || 'monthly_vault';
  save.monthlyVaultActive = !!active[monthlyEntitlement];
  save.storeEntitlements = {};
  for (const key of Object.keys(active)) {
    save.storeEntitlements[key] = true;
  }
  persistSave();
}

function grantRestoredPermanentProducts(customerInfo) {
  const purchasedIds = customerInfo && Array.isArray(customerInfo.allPurchasedProductIdentifiers)
    ? customerInfo.allPurchasedProductIdentifiers
    : [];
  for (const product of STORE_PRODUCT_CATALOG) {
    if (product.id !== 'starter_pack') continue;
    const storeProductId = currentStoreProductId(product);
    if (!storeProductId || !purchasedIds.includes(storeProductId)) continue;
    const ledgerKey = productOwnershipLedgerKey(product.id);
    if (receiptLedgerHas(ledgerKey)) continue;
    if (grantProductRewardsLocally(product.id)) {
      markReceiptLedger(ledgerKey);
    }
  }
}

function deliverPurchaseRewards(product, purchaseResult) {
  if (!product || !purchaseResult) return false;
  if (product.id === 'starter_pack') {
    const ledgerKey = productOwnershipLedgerKey(product.id);
    if (receiptLedgerHas(ledgerKey)) return false;
    if (grantProductRewardsLocally(product.id)) {
      markReceiptLedger(ledgerKey);
      return true;
    }
    return false;
  }

  const transaction = purchaseResult.transaction || {};
  const ledgerKey = transactionLedgerKey(product.id, transaction.transactionIdentifier || purchaseResult.productIdentifier);
  if (receiptLedgerHas(ledgerKey)) return false;
  if (grantProductRewardsLocally(product.id)) {
    markReceiptLedger(ledgerKey);
    return true;
  }
  return false;
}

function showStoreNotice(message) {
  alert(message);
}

async function ensureRevenueCatConfigured() {
  monetizationState.platform = detectMonetizationPlatform();
  monetizationState.pluginAvailable = !!getPurchasesPlugin();

  if (monetizationState.platform === 'web') {
    monetizationState.configured = false;
    setMonetizationStatus('Web preview mode. Store billing is available in native App Store and Play builds.');
    return null;
  }

  const plugin = getPurchasesPlugin();
  if (!plugin) {
    monetizationState.configured = false;
    setMonetizationStatus(`${purchasePlatformLabel()} shell detected, but the Capacitor Purchases plugin is not available.`);
    return null;
  }

  const apiKey = getRevenueCatApiKeyForPlatform();
  if (!apiKey) {
    monetizationState.configured = false;
    setMonetizationStatus(`${purchasePlatformLabel()} build detected. Add the RevenueCat public SDK key in Settings before testing purchases.`);
    return null;
  }

  const appUserID = monetizationAppUserId();

  try {
    const configuredResponse = typeof plugin.isConfigured === 'function'
      ? await plugin.isConfigured()
      : { isConfigured: false };

    if (!configuredResponse || !configuredResponse.isConfigured) {
      await plugin.configure({
        apiKey,
        appUserID,
        shouldShowInAppMessagesAutomatically: true
      });
      monetizationState.configured = true;
      monetizationState.configuredAppUserId = appUserID;
    } else if (monetizationState.configuredAppUserId && monetizationState.configuredAppUserId !== appUserID && typeof plugin.logIn === 'function') {
      const loginResult = await plugin.logIn({ appUserID });
      monetizationState.customerInfo = loginResult.customerInfo || monetizationState.customerInfo;
      monetizationState.configuredAppUserId = appUserID;
      monetizationState.configured = true;
    } else {
      monetizationState.configured = true;
      if (!monetizationState.configuredAppUserId) {
        monetizationState.configuredAppUserId = appUserID;
      }
    }

    if (typeof plugin.setDisplayName === 'function') {
      await plugin.setDisplayName({ displayName: (save && (save.username || save.playerId)) || null });
    }
    if (typeof plugin.setEmail === 'function') {
      const email = typeof cloudState !== 'undefined' && cloudState && cloudState.user && cloudState.user.email
        ? cloudState.user.email
        : null;
      await plugin.setEmail({ email });
    }
    return plugin;
  } catch (error) {
    monetizationState.configured = false;
    setMonetizationStatus('RevenueCat setup failed.', error && error.message ? error.message : '');
    return null;
  }
}

async function refreshStoreCatalog() {
  if (monetizationState.isLoadingProducts) return monetizationState.productsByCatalogId;
  const plugin = await ensureRevenueCatConfigured();
  if (!plugin) return monetizationState.productsByCatalogId;

  monetizationState.isLoadingProducts = true;
  try {
    const nonSubscriptionIds = [];
    const subscriptionIds = [];

    for (const product of STORE_PRODUCT_CATALOG) {
      const storeProductId = currentStoreProductId(product);
      if (!storeProductId) continue;
      if (isSubscriptionProduct(product)) subscriptionIds.push(storeProductId);
      else nonSubscriptionIds.push(storeProductId);
    }

    const nextProductsByStoreId = {};
    const nextProductsByCatalogId = {};

    if (nonSubscriptionIds.length) {
      const nonSubResult = await plugin.getProducts({
        productIdentifiers: nonSubscriptionIds,
        type: RC_PRODUCT_CATEGORY_NON_SUBSCRIPTION
      });
      for (const storeProduct of nonSubResult.products || []) {
        nextProductsByStoreId[storeProduct.identifier] = storeProduct;
        const catalogItem = loadCatalogItemForStoreId(storeProduct.identifier);
        if (catalogItem) nextProductsByCatalogId[catalogItem.id] = storeProduct;
      }
    }

    if (subscriptionIds.length) {
      const subResult = await plugin.getProducts({
        productIdentifiers: subscriptionIds,
        type: RC_PRODUCT_CATEGORY_SUBSCRIPTION
      });
      for (const storeProduct of subResult.products || []) {
        nextProductsByStoreId[storeProduct.identifier] = storeProduct;
        const catalogItem = loadCatalogItemForStoreId(storeProduct.identifier);
        if (catalogItem) nextProductsByCatalogId[catalogItem.id] = storeProduct;
      }
    }

    monetizationState.productsByStoreId = nextProductsByStoreId;
    monetizationState.productsByCatalogId = nextProductsByCatalogId;

    if (typeof plugin.getCustomerInfo === 'function') {
      const customerInfoResponse = await plugin.getCustomerInfo();
      monetizationState.customerInfo = customerInfoResponse.customerInfo || null;
      if (monetizationState.customerInfo) {
        syncEntitlementsFromCustomerInfo(monetizationState.customerInfo);
        grantRestoredPermanentProducts(monetizationState.customerInfo);
      }
    }

    const loadedCount = Object.keys(monetizationState.productsByCatalogId).length;
    setMonetizationStatus(`${purchasePlatformLabel()} billing ready. ${loadedCount}/${STORE_PRODUCT_CATALOG.length} store products loaded.`);
    return monetizationState.productsByCatalogId;
  } catch (error) {
    setMonetizationStatus('Store catalog sync failed.', error && error.message ? error.message : '');
    return monetizationState.productsByCatalogId;
  } finally {
    monetizationState.isLoadingProducts = false;
  }
}

async function initMonetization(options = {}) {
  if (monetizationState.initialized && !options.force) return monetizationState;

  monetizationState.config = loadMonetizationConfig();
  monetizationState.platform = detectMonetizationPlatform();
  monetizationState.pluginAvailable = !!getPurchasesPlugin();
  monetizationState.initialized = true;

  if (monetizationState.platform === 'web') {
    monetizationState.configured = false;
    setMonetizationStatus('Web preview mode. Store billing is available in native App Store and Play builds.');
    return monetizationState;
  }

  await refreshStoreCatalog();
  return monetizationState;
}

async function beginStorePurchase(productId) {
  const product = STORE_PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return;

  if (!isNativeStoreBuild()) {
    showStoreNotice(`${product.title} is wired for App Store and Google Play builds. Use the Capacitor iPhone or Android app, not the web preview.`);
    return;
  }

  const plugin = await ensureRevenueCatConfigured();
  if (!plugin) {
    showStoreNotice('Billing is not ready yet. Add the RevenueCat public SDK key in Settings, then sync the native app.');
    return;
  }

  if (!monetizationState.productsByCatalogId[product.id]) {
    await refreshStoreCatalog();
  }

  const storeProduct = monetizationState.productsByCatalogId[product.id];
  if (!storeProduct) {
    showStoreNotice(`${product.title} is not loading from ${purchasePlatformLabel()} yet. Check the RevenueCat product mapping and native store product IDs.`);
    return;
  }

  monetizationState.isPurchasing = true;
  setMonetizationStatus(`Opening ${purchasePlatformLabel()} purchase flow for ${product.title}...`);

  try {
    const purchaseResult = await plugin.purchaseStoreProduct({
      product: storeProduct,
      googleIsPersonalizedPrice: false
    });

    monetizationState.customerInfo = purchaseResult.customerInfo || monetizationState.customerInfo;
    if (monetizationState.customerInfo) {
      syncEntitlementsFromCustomerInfo(monetizationState.customerInfo);
    }

    const delivered = deliverPurchaseRewards(product, purchaseResult);
    setMonetizationStatus(
      delivered
        ? `${product.title} purchased and rewards delivered.`
        : `${product.title} purchase completed.`
    );
    storeUiRefresh();
  } catch (error) {
    const cancelled = !!(error && error.userCancelled);
    if (cancelled) {
      setMonetizationStatus(`${product.title} purchase cancelled.`);
    } else {
      setMonetizationStatus(`${product.title} purchase failed.`, error && error.message ? error.message : '');
      showStoreNotice(error && error.message ? error.message : 'The store purchase could not be completed.');
    }
  } finally {
    monetizationState.isPurchasing = false;
    storeUiRefresh();
  }
}

async function restoreStorePurchases() {
  if (!isNativeStoreBuild()) {
    showStoreNotice('Restore Purchases is only available inside the iPhone or Android app shell.');
    return false;
  }

  const plugin = await ensureRevenueCatConfigured();
  if (!plugin) return false;

  monetizationState.isRestoring = true;
  setMonetizationStatus(`Checking ${purchasePlatformLabel()} for restorable purchases...`);

  try {
    const restoreResult = await plugin.restorePurchases();
    monetizationState.customerInfo = restoreResult.customerInfo || null;
    if (monetizationState.customerInfo) {
      syncEntitlementsFromCustomerInfo(monetizationState.customerInfo);
      grantRestoredPermanentProducts(monetizationState.customerInfo);
    }
    setMonetizationStatus('Restore complete. Permanent purchases and active entitlements are now synced on this device.');
    storeUiRefresh();
    return true;
  } catch (error) {
    setMonetizationStatus('Restore failed.', error && error.message ? error.message : '');
    showStoreNotice(error && error.message ? error.message : 'Previous purchases could not be restored.');
    return false;
  } finally {
    monetizationState.isRestoring = false;
    storeUiRefresh();
  }
}

function getMonetizationConfigTemplate() {
  return JSON.stringify(loadMonetizationConfig(), null, 2);
}

function renderMonetizationSettingsSection(container) {
  const section = document.createElement('div');
  section.className = 'profile-section';
  section.innerHTML = `
    <div class="profile-section-title">Store Billing</div>
    <div class="cloud-status-row">
      <div>
        <div class="cloud-status-label">${purchasePlatformLabel()}</div>
        <div class="cloud-status-text">${monetizationStatusText()}</div>
      </div>
      <div class="cloud-status-badge ${isNativeStoreBuild() ? 'online' : 'offline'}">${isNativeStoreBuild() ? 'NATIVE' : 'WEB'}</div>
    </div>
    <textarea id="monetizationConfigInput" class="cloud-config-input" spellcheck="false">${getMonetizationConfigTemplate()}</textarea>
    <div class="cloud-config-hint">Paste RevenueCat public SDK keys here when you are ready to test Apple and Google billing. Do not put secret keys here.</div>
    <div class="cloud-btn-row">
      <button id="monetizationConfigSaveBtn" class="cloud-btn" type="button">Save Billing Config</button>
      <button id="monetizationConfigSeedBtn" class="cloud-btn cloud-btn-muted" type="button">Reload Template</button>
      <button id="monetizationCatalogBtn" class="cloud-btn cloud-btn-muted" type="button">Sync Store Catalog</button>
    </div>
  `;
  container.appendChild(section);

  section.querySelector('#monetizationConfigSaveBtn').addEventListener('click', () => {
    try {
      saveMonetizationConfig(section.querySelector('#monetizationConfigInput').value);
    } catch (error) {
      alert(error.message || 'Billing config could not be saved.');
    }
  });

  section.querySelector('#monetizationConfigSeedBtn').addEventListener('click', () => {
    section.querySelector('#monetizationConfigInput').value = getMonetizationConfigTemplate();
  });

  section.querySelector('#monetizationCatalogBtn').addEventListener('click', async () => {
    await refreshStoreCatalog();
  });
}
