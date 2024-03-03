import { usePageEvents } from '@/shared/lib/next';
import { $$catalogPage } from './model';

export const CatalogPage = () => {
  usePageEvents({
    open: $$catalogPage.opened,
    close: $$catalogPage.closed,
  });

  return <div>pageCatalog</div>;
};
