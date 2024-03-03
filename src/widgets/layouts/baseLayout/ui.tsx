import Link from 'next/link';
import type { PropsWithChildren } from 'react';

export const BaseLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/catalog">Catalog</Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};
