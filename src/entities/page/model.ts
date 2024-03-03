import { createEffect, createStore, restore, sample } from 'effector';

import type { StaticPageContext } from '@/shared/lib/nextjs-effector';
import { getRootRelativeURL } from '@/shared/utils/url';

const getPageInfoFx = createEffect<StaticPageContext, any>((context) => {
  const url = getRootRelativeURL(context.params?.url);

  const type = url.includes('/about') ? 'about' : 'catalog';

  return {
    type,
    context,
  };
});

const $pageInfo = restore(getPageInfoFx.doneData, null);
const $pageType = $pageInfo.map((v) => v?.type ?? null);
const $pageSeo = $pageInfo.map((v) => v?.seo ?? {});
const $pageUrl = createStore<string>('');

export const $$page = {
  $pageInfo,
  $pageType,
  $pageSeo,
  $pageUrl,
  getPageInfoFx,
};
