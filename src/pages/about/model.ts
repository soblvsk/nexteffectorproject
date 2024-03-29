import { createEvent, createStore } from 'effector';

import type { StaticPageContext } from '@/shared/lib/nextjs-effector';
import { debug } from 'patronum';

const enter = createEvent<StaticPageContext>();
const opened = createEvent<{ url: string }>();
const closed = createEvent<{ url: string }>();

const $isPageOpened = createStore(false)
  .on(opened, () => true)
  .on(closed, () => false);

debug({ about: $isPageOpened });

export const $$aboutPage = {
  enter,
  opened,
  closed,
};
