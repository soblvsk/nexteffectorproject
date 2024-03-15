import { EventCallable, createEffect, createEvent, restore, sample } from 'effector';

import type { StaticPageContext } from '@/shared/lib/nextjs-effector';
import { getRootRelativeURL } from '@/shared/utils/url';
import { $$aboutPage } from '@/pages/about/model';
import { $$catalogPage } from '@/pages/catalog/model';

type PageTypes = 'home' | 'about' | 'catalog';

interface PageEntity {
  type: PageTypes;
  seo: {
    title: string;
    description?: string;
  };
}

type PageNameFromSitemap = Exclude<PageEntity['type'], 'home'>;
const pageEventMap: Record<PageNameFromSitemap, EventCallable<StaticPageContext>> = {
  about: $$aboutPage.enter,
  catalog: $$catalogPage.enter,
};

const getPageInfoFx = createEffect<StaticPageContext, any>((context) => {
  const url = getRootRelativeURL(context.params?.url);

  const type = url.includes('/about') ? 'about' : 'catalog';

  return {
    type,
    context,
  };
});

const runPageEventFx = createEffect<{ type: PageEntity['type']; context: StaticPageContext }, void>(
  ({ type, context }) => {
    if (type in pageEventMap) {
      pageEventMap[type as PageNameFromSitemap](context);
    }
  },
);

const enter = createEvent<StaticPageContext>();

sample({
  source: enter,
  target: getPageInfoFx,
});

sample({
  clock: getPageInfoFx.done,
  fn: ({ params, result }) => ({ type: result.type, context: params }),
  target: runPageEventFx,
});

const $pageInfo = restore(getPageInfoFx.doneData, null);
// const $pageType = $pageInfo.map((v) => v?.type ?? null);
const $pageSeo = $pageInfo.map((v) => v?.seo ?? {});

export const $$page = {
  $pageInfo,
  $pageSeo,
  getPageInfoFx,
  enter,
};
