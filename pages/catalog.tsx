import { createGSP } from '@/application/pageFactories/baseLayoutPage';
import { $$page } from '@/entities/page/model';
import { CatalogPage } from '@/pages/catalog/component';
import { BaseLayout } from '@/widgets/layouts/baseLayout/ui';
import { useUnit } from 'effector-react';
import { NextSeo } from 'next-seo';
import { ReactNode } from 'react';

const Page = () => {
  const pageSeo = useUnit($$page.$pageSeo);
  console.log('Catalog SEO');
  return (
    <>
      <NextSeo {...pageSeo} />
      <CatalogPage />
    </>
  );
};

export const getStaticProps = createGSP({
  pageEvent: $$page.enter,

  customize({ scope }) {
    const isNotFound = scope.getState($$page.$pageInfo) === null;

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

Page.getLayout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;

export default Page;
