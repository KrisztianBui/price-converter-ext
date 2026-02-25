import {parsePrice} from '@src/utils/parsePrice';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'convert-price',
    title: 'Convert Price',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'convert-price' || !info.selectionText || !tab?.id) return;

  const result = convertPrice(info.selectionText);

  chrome.tabs.sendMessage(tab.id, { type: 'SHOW_CONVERSION', result });
});

function convertPrice(text: string): string {
  const parsed = parsePrice(text.trim());
  if (!parsed) return `Could not parse a price from: "${text}"`;

  // TODO: apply actual conversion rate
  return `${parsed.currency} ${parsed.amount}`;
}