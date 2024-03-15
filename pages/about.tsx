import { createGSP } from '@/application/pageFactories/baseLayoutPage';
import { $$page } from '@/entities/page/model';
import { AboutPage } from '@/pages/about/component';
import { BaseLayout } from '@/widgets/layouts/baseLayout/ui';
import { ReactNode } from 'react';
import { useUnit } from 'effector-react';
import { NextSeo } from 'next-seo';

const Page = () => {
  const pageSeo = useUnit($$page.$pageSeo);
  console.log('About SEO');

  return (
    <>
      <NextSeo {...pageSeo} />
      <AboutPage />
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
