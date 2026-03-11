import {parsePrice} from '@src/utils/parsePrice';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'convert-price',
    title: 'Convert Price',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== 'convert-price' || !info.selectionText) return;

  const parsed = parsePrice(info.selectionText.trim());
  const pending = parsed
    ? { amount: parsed.amount, currency: parsed.currency }
    : { amount: null, currency: null };

  chrome.storage.session.set({ pendingConversion: pending });
  chrome.action.openPopup();
});