import type { ParsedUrlQuery } from 'node:querystring';

import { createEvent, attach, createStore, sample, restore } from 'effector';
import equal from 'fast-deep-equal';
import type { NextRouter } from 'next/router';

import { getUrlWithoutOriginFromUrlObject } from '@/shared/utils/url';

import type { NextHistoryState } from './types';
import { PageContext } from '@/shared/lib/nextjs-effector';

const routerInitialized = createEvent<NextRouter>();
const routerUpdated = createEvent<NextRouter>();
const routerStateChanged = createEvent<PageContext>();
const queryParamsChanged = createEvent<ParsedUrlQuery>();
const urlChanged = createEvent<string>();
const beforePopstateChanged = createEvent<NextHistoryState>();

const $router = restore(routerInitialized, null);

sample({
  clock: routerUpdated,
  target: $router,
});

// Пользовательское хранилище для тестовых примеров, связанных с проблемами, связанными с потерей области видимости
const $isRouterInitialized = createStore(false).on(
  routerInitialized,
  () => true
);

/*
 * Подготовка query params
 * ПРИМЕЧАНИЕ: next.js `query` также содержит `params` из динамических маршрутов,
 * Поэтому мы не используем его в качестве источника истины!
 * Вместо этого мы будем использовать `routerStateChanged`, который запускается всякий раз, когда
 * роутер изменяется, но только, когда он `isReady`,
 * он содержит нормализованное состояние роутера
 */

const $query = restore(queryParamsChanged, {});

sample({
  clock: routerStateChanged,
  source: $query,
  filter: (currentQuery, { query }) => {
    const isDeepEq = equal(currentQuery, query);
    return !isDeepEq;
  },
  fn: (_, { query }) => query,
  target: queryParamsChanged,
});

/*
 * URL текущей страницы
 * ПРИМЕЧАНИЕ: Не использовать его на стороне сервера из-за пустого инициала
 * Обновлено только на стороне клиента
 */
const $url = restore(urlChanged, '');

// Установка URL для инициализации роутера
sample({
  clock: routerInitialized,
  fn: ({ asPath }) => asPath,
  target: urlChanged,
});

// Установка URL для инициализации роутера / `asPath` обновленный
sample({
  clock: routerStateChanged,
  source: $url,
  filter: (currentUrl, { asPath }) => Boolean(asPath) && currentUrl !== asPath,
  fn: (_, { asPath }) => asPath!,
  target: urlChanged,
});

// Использование router.push с options
const pushFx = attach({
  source: $router,
  effect(
    router,
    {
      url,
      options = {},
    }: { url: NextHistoryState['url']; options?: NextHistoryState['options'] }
  ) {
    return router?.push(url, undefined, options);
  },
});

// Обновлять URL после push
sample({
  clock: pushFx.done,
  fn: ({ params: { url } }) =>
    typeof url === 'string' ? url : getUrlWithoutOriginFromUrlObject(url),
  target: $url,
});

// Только серверные модули. Обновления из серверных событий (with fork)
const $serverUrl = createStore('');
const $serverQueryParams = createStore<ParsedUrlQuery>({});
const $serverParams = createStore<ParsedUrlQuery>({});

export const $$navigation = {
  routerInitialized,
  routerUpdated,
  routerStateChanged,
  urlChanged,
  queryParamsChanged,
  beforePopstateChanged,
  $router,
  $isRouterInitialized,
  $query,
  $url,
  pushFx,
  $serverUrl,
  $serverQueryParams,
  $serverParams,
};
