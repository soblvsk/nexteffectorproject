import { useUnit } from "effector-react";
import equal from "fast-deep-equal";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";
import { useRef } from "react";

import { useIsomorphicLayoutEffect } from "@/shared/hooks/useIsomorphicLayoutEffect";
import { ContextNormalizers } from "@/shared/lib/next";
import type { PageContext } from "@/shared/lib/nextjs-effector";

import { $$navigation } from "@/entities/navigation/model";

export const WithEffectorRouterEvents = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const router = useRouter();
  const beforePopstateChanged = useUnit($$navigation.beforePopstateChanged);
  const routerInitialized = useUnit($$navigation.routerInitialized);
  const routerUpdated = useUnit($$navigation.routerUpdated);
  const routerStateChanged = useUnit($$navigation.routerStateChanged);
  const isInitRouterEventCalledRef = useRef(false);
  const normalizedRouterStateRef = useRef<PageContext | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (router.isReady && !isInitRouterEventCalledRef.current) {
      routerInitialized(router);
      isInitRouterEventCalledRef.current = true;
    }

    return () => {
      isInitRouterEventCalledRef.current = false;
    };
  }, [router.isReady]);

  useIsomorphicLayoutEffect(() => {
    if (router.isReady) {
      // Обновление экземпляра роутера
      routerUpdated(router);
      // Обновление нормализованного state с маршрутизатора только в том случае, если оно изменилось
      const normalizedRouterState = ContextNormalizers.router(router);
      if (!equal(normalizedRouterState, normalizedRouterStateRef.current)) {
        routerStateChanged(ContextNormalizers.router(router));
      }
      normalizedRouterStateRef.current = normalizedRouterState;
    }
  }, [router]);

  // Обработка beforePopState
  // ПРИМЕЧАНИЕ: в настоящее время next поддерживает только один обратный вызов, который может быть перезаписан при обновлениях
  // Смотреть: https://github.com/vercel/next.js/discussions/34835
  useIsomorphicLayoutEffect(() => {
    router.beforePopState((state) => {
      beforePopstateChanged(state);
      return true;
    });
  }, [router, beforePopstateChanged]);

  return <>{children}</>;
};
