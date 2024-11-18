export function Indicator() {
  return import.meta.env.DEV ? (
    <div
      aria-hidden
      className="fixed right-4 bottom-4 z-[99] flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-gray-800 p-8 font-sans text-base text-white"
    >
      <p className="block 3xs:hidden">base</p>
      <p className="3xs:block 2xs:hidden hidden">3xs</p>
      <p className="2xs:block hidden xs:hidden">2xs</p>
      <p className="xs:block hidden sm:hidden">xs</p>
      <p className="hidden sm:block md:hidden">sm</p>
      <p className="hidden md:block lg:hidden">md</p>
      <p className="hidden lg:block xl:hidden">lg</p>
      <p className="hidden xl:block 2xl:hidden">xl</p>
      <p className="3xl:hidden hidden 2xl:block">2xl</p>
      <p className="3xl:block hidden">3xl</p>
    </div>
  ) : null;
}
