import type { EventCallable } from 'effector';
import { createEffect, createEvent, sample } from 'effector';
import type { GetStaticPaths } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useMemo, type ComponentType, type ReactNode } from 'react';

import type { StaticPageContext } from '@/shared/lib/nextjs-effector';

import { $$page } from '@/entities/page/model';

import { BaseLayout } from '@/widgets/layouts/baseLayout/ui';

import { $$aboutPage } from '@/pages/about/model';
import { $$catalogPage } from '@/pages/catalog/model';

import { createGSP } from '@/application/pageFactories/baseLayoutPage';
import { useUnit } from 'effector-react';

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
  target: $$page.getPageInfoFx,
});

sample({
  clock: $$page.getPageInfoFx.done,
  fn: ({ params, result }) => ({ type: result.type, context: params }),
  target: runPageEventFx,
});

const pageMap: Record<PageNameFromSitemap, ComponentType> = {
  about: dynamic(() => import('@/pages/about/component').then((mod) => mod.AboutPage)),
  catalog: dynamic(() => import('@/pages/catalog/component').then((mod) => mod.CatalogPage)),
};

export const getStaticProps = createGSP({
  pageEvent: enter,

  customize({ scope }) {
    const isNotFound = scope.getState($$page.$pageInfo) === null;

    console.log({ serverState: scope.getState($$page.$pageInfo) });

    // if (isNotFound) {
    //   return {
    //     notFound: true,
    //     revalidate: 120,
    //   };
    // }

    return {
      props: {},
      revalidate: 120,
    };
  },
});

export const getStaticPaths: GetStaticPaths = () => {
  const paths: string[] = ['/about', '/catalog'];

  return {
    paths,
    fallback: 'blocking',
  };
};

const AllPage = () => {
  const type = useUnit($$page.$pageType);

  const PageComponent =
    type !== null && type in pageMap ? pageMap[type as keyof typeof pageMap] : null;

  const router = useRouter();

  const uKey = useMemo(() => `${type}_${router.asPath}`, [router.asPath, type]);
  console.log({ uKey });

  if (!PageComponent) return <div>Ничего не найдено</div>;

  return <PageComponent />;
};

const AllPageSeo = () => {
  const pageSeo = useUnit($$page.$pageSeo);

  return <NextSeo {...pageSeo} />;
};

const Page = (props: any = {}) => {
  return (
    <>
      <AllPageSeo />
      <AllPage {...props} />
    </>
  );
};

Page.getLayout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;

export default Page;
