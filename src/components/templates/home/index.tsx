import { Helmet } from 'react-helmet-async';

type Props = {};

const HomeTemplate = (props: Props) => {
  return (
    <div className="px-8">
      <Helmet>
        <title>Homepage</title>
        <meta name="description" content="Vite React Starter" />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>

      <main className="flex-1 flex flex-col items-center justify-center min-h-screen py-16">
        <h1 className="text-center leading-[1.15]">
          Welcome to{' '}
          <a
            href="https://nextjs.org"
            className="text-[#0070f3] no-underline hover:underline focus:underline active:underline"
          >
            Vite.js!
          </a>
        </h1>

        <p className="py-16 text-[1.5rem] text-center leading-normal">
          Get started by editing{' '}
          <code className="bg-zinc-50 dark:bg-[#111]">pages/index.tsx</code>
        </p>

        <div className="flex max-[600px]:flex-col items-center justify-center flex-wrap max-[600px]:w-full max-w-[50rem]">
          <a
            href="https://nextjs.org/docs"
            className="max-w-[19rem] m-4 p-6 border border-[#eaeaea] dark:border-[#222] hover:border-[#0070f3] focus:border-[#0070f3] active:border-[#0070f3] rounded-2xl text-inherit hover:text-[#0070f3] focus:text-[#0070f3] active:text-[#0070f3] text-left no-underline transition-colors"
          >
            <h2 className="mb-4 text-[1.5rem]">Documentation &rarr;</h2>
            <p className="text-[1.25rem] leading-normal">
              Find in-depth information about Vite.js features and API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn"
            className="max-w-[19rem] m-4 p-6 border border-[#eaeaea] dark:border-[#222] hover:border-[#0070f3] focus:border-[#0070f3] active:border-[#0070f3] rounded-2xl text-inherit hover:text-[#0070f3] focus:text-[#0070f3] active:text-[#0070f3] text-left no-underline transition-colors"
          >
            <h2 className="mb-4 text-[1.5rem]">Learn &rarr;</h2>
            <p className="text-[1.25rem] leading-normal">
              Learn about Next.js in an interactive course with quizzes!
            </p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className="max-w-[19rem] m-4 p-6 border border-[#eaeaea] dark:border-[#222] hover:border-[#0070f3] focus:border-[#0070f3] active:border-[#0070f3] rounded-2xl text-inherit hover:text-[#0070f3] focus:text-[#0070f3] active:text-[#0070f3] text-left no-underline transition-colors"
          >
            <h2 className="mb-4 text-[1.5rem]">Examples &rarr;</h2>
            <p className="text-[1.25rem] leading-normal">
              Discover and deploy boilerplate example Next.js projects.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[19rem] m-4 p-6 border border-[#eaeaea] dark:border-[#222] hover:border-[#0070f3] focus:border-[#0070f3] active:border-[#0070f3] rounded-2xl text-inherit hover:text-[#0070f3] focus:text-[#0070f3] active:text-[#0070f3] text-left no-underline transition-colors"
          >
            <h2 className="mb-4 text-[1.5rem]">Deploy &rarr;</h2>
            <p className="text-[1.25rem] leading-normal">
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>
    </div>
  );
};

export { HomeTemplate };
