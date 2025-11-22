import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans max-w-[1920px] mx-auto relative">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center py-20 px-16 sm:items-start gap-16">
        <div className="flex flex-col gap-8">
          <Image
            src="/logos/eisko-logo.svg"
            alt="Eisko logo"
            width={140}
            height={20}
            priority
          />
          <p className="text-5xl font-semibold text-foreground/96 uppercase tracking-[0.01rem] leading-15">
            Switchboard Diagram Analyzer
          </p>
          <p className="text-base font-semibold italic tracking-wide -mt-6 text-foreground/40">
            A SinceAI project
          </p>
        </div>

        <div className="flex flex-col gap-8 text-center sm:items-start sm:text-left">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-foreground">Features:</h2>
            <ul className="flex flex-col gap-3 text-zinc-600">
              <li className="flex gap-3">
                <span className="text-djanbee">•</span>
                <span className="text-foreground/88 font-medium">
                  Detect and extract circuit diagrams with machine vision
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-djanbee">•</span>
                <span className="text-foreground/88 font-medium">
                  Aggregate and summarize items
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-djanbee">•</span>
                <span className="text-foreground/88 font-medium">
                  Human in the loop architecture for AI monitoring
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-djanbee hover:brightness-95 px-5 text-black transition-all duration-150 ease-in-out md:w-[200px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20"
            href="/upload"
          >
            Go to Upload
          </Link>
        </div>
      </main>

      {/* Watermark */}
      <div className="fixed bottom-6 left-6 flex items-center gap-2 opacity-40">
        <Image
          src="/logos/djanbee-logo.svg"
          alt="Djanbee logo"
          width={96}
          height={24}
        />
        <span className="text-sm font-semibold tracking-wider text-foreground mt-0.5">
          solution
        </span>
      </div>
    </div>
  );
}
