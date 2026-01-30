import { IconLogo } from "@/assets/media/icons";
import { ImageIllustration } from "@/assets/media/images";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      aria-labelledby="a11ty-headline"
      className="@container grid h-svh w-full grid-rows-[auto_1fr] lg:grid-cols-12 lg:grid-rows-1"
    >
      <header className="col-span-full flex items-center justify-center rounded-b-xl bg-grey-900 py-6 text-white lg:hidden">
        <IconLogo />
      </header>

      <section className="col-span-5 hidden p-5 lg:block">
        <div
          className="flex h-full flex-col justify-between rounded-xl bg-(image:--img-url) bg-cover bg-no-repeat p-16"
          style={{ "--img-url": `url(${ImageIllustration})` }}
        >
          <IconLogo className="text-white" />

          <hgroup className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Keep track of your money and save for your future
            </h2>
            <p className="text-sm text-white">
              Personal finance app puts you in control of your spending. Track transactions, set
              budgets, and add to savings pots easily.
            </p>
          </hgroup>
        </div>
      </section>

      <section className="self-center px-[6cqw] lg:col-span-7">{children}</section>
    </main>
  );
}
