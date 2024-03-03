import type { NextPage } from 'next';

import type { AppProps } from 'next/app';

import { WithEffectorRouterEvents } from '../composes/withEffectorRouterEvents';
import { EffectorNext } from '@effector/next';
import { INITIAL_STATE_KEY } from '@/shared/lib/nextjs-effector/constants';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const PageWithLayout = ({
  Page,
  props,
}: {
  Page: AppPropsWithLayout['Component'];
  props: AppPropsWithLayout['pageProps'];
}) => {
  const getLayout = Page.getLayout ?? ((page) => page);

  return <>{getLayout(<Page {...props} />)}</>;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const { [INITIAL_STATE_KEY]: initialState } = pageProps;

  return (
    <EffectorNext values={initialState}>
      <WithEffectorRouterEvents>
        <PageWithLayout Page={Component} props={pageProps} />
      </WithEffectorRouterEvents>
    </EffectorNext>
  );
};

export default App;
