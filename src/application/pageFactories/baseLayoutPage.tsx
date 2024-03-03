import { fork } from 'effector';

import { ContextNormalizers } from '@/shared/lib/next';
import { createGSPFactory, createGSSPFactory } from '@/shared/lib/nextjs-effector';

import { $$navigation } from '@/entities/navigation/model';

export const createGSP = createGSPFactory({
  sharedEvents: [],
});

export const cresteGSSP = createGSSPFactory({
  sharedEvents: [],
  createServerScope(context) {
    const normalizedContext = ContextNormalizers.getServerSideProps(context);

    return fork({
      values: [
        [$$navigation.$serverUrl, normalizedContext.asPath],
        [$$navigation.$serverQueryParams, normalizedContext.query],
        [$$navigation.$serverParams, normalizedContext.params],
      ],
    });
  },
});
