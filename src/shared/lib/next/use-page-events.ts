import type { EventCallable } from 'effector';
import { createEvent } from 'effector';
import type { Gate } from 'effector-react';
import { useUnit } from 'effector-react';
import equal from 'fast-deep-equal';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import { ContextNormalizers } from './context-normalizers';

const fallbackPageEvents = {
  close: createEvent<any | void>(),
};
/*
 * Разрешить передавать как конфигурационные данные или такие события, как открытие, закрытие, обновление
 */
export function useBasePageEvents<P>(
  config:
    | Gate<P>
    | {
        open: EventCallable<P>;
        close?: EventCallable<P>;
        update?: EventCallable<P>;
      },
  props: P,
) {
  const conf = {
    open: config.open as EventCallable<any>,
    close: config.close as EventCallable<any>,
  };

  if (!config.close) {
    conf.close = fallbackPageEvents.close;
  }

  const { open, close /* , update */ } = useUnit(conf);
  const router = useRouter();
  const propsRef = useRef<{ value: any; count: number }>({
    value: null,
    count: 0,
  });
  const isPropsAssignedOnceRef = useRef(false);

  if (!equal(propsRef.current.value, props)) {
    propsRef.current.value = props;
    if (isPropsAssignedOnceRef.current) {
      propsRef.current.count += 1;
    }
    isPropsAssignedOnceRef.current = true;
  }

  useEffect(() => {
    if (router.isReady) {
      const currRef = propsRef.current;

      open(currRef.value);

      return () => {
        close?.(currRef.value);
      };
    }

    return () => {
      // noop
    };
  }, [open, close, router.isReady]);
}

export const usePageEvents = <P>(
  config:
    | Gate<P>
    | {
        open: EventCallable<P>;
        close?: EventCallable<P>;
        update?: EventCallable<P>;
      },
  props?: P,
) => {
  const router = useRouter();
  const context = props ?? ({ url: ContextNormalizers.router(router).asPath } as P);
  console.log({ contextUrl: context.url });
  return useBasePageEvents(config, context);
};
