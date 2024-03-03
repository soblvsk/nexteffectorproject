import { usePageEvents } from '@/shared/lib/next';
import { $$aboutPage } from './model';

export const AboutPage = () => {
  usePageEvents({
    open: $$aboutPage.opened,
    close: $$aboutPage.closed,
  });

  return <div>pageAbout</div>;
};
