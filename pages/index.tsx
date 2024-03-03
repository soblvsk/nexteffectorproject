import { BaseLayout } from '@/widgets/layouts/baseLayout/ui';
import { ReactNode } from 'react';

const Page = () => (
  <div>
    <div>HomePage</div>
  </div>
);

Page.getLayout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;

export default Page;
