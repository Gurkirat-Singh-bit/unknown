import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";

export type FooterSocialLink = { label: string; href: string };
type FooterLink = { label: string; href: string; external?: boolean };

const exploreLinks: FooterLink[] = [
  { label: "All hackathons", href: "/hackathons" },
  { label: "Search events", href: "/#top" },
  { label: "Categories", href: "/#categories" },
];
const categoryLinks: FooterLink[] = [
  { label: "Hackathons", href: "/hackathons" },
  { label: "Online events", href: "/hackathons?mode=online" },
];
const aboutLinks: FooterLink[] = [
  { label: "About HackRadar", href: "/about" },
  {
    label: "Source code",
    href: "https://github.com/Gurkirat-Singh-bit/unknown",
    external: true,
  },
];

export function SiteFooter({
  socialLinks = [],
}: {
  socialLinks?: readonly FooterSocialLink[];
}) {
  return (
    <footer className="relative isolate mt-4 overflow-hidden bg-footer text-white">
      <div className="mx-auto w-full max-w-7xl px-6 pt-12 sm:px-10 sm:pt-16 lg:px-14 lg:pt-20">
        <div className={`grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 ${socialLinks.length ? "lg:grid-cols-[1fr_1.3fr_1.1fr_0.7fr_2fr]" : "lg:grid-cols-[1fr_1.3fr_1.1fr_2fr]"}`}>
          <FooterGroup title="Explore" links={exploreLinks} />
          <FooterGroup title="Categories" links={categoryLinks} />
          <FooterGroup title="HackRadar" links={aboutLinks} />
          {socialLinks.length > 0 && <div>
            <h2 className="mb-5 text-base font-semibold text-white">Social</h2>
            <div className="flex min-h-6 flex-col items-start gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/70 transition-colors hover:text-lime"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>}
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <h2 className="text-lg font-semibold text-white">
              Find your next hackathon
            </h2>
            <p className="mt-4 mb-5 text-sm leading-6 text-white/70">
              Explore submissions, locations, and prizes.
            </p>
            <a
              href="/hackathons"
              className="flex min-h-12 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Browse events
              <ArrowUpRightIcon size={16} />
            </a>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-white/10 pt-5 pb-6 text-xs text-white/60">
          <span>© {new Date().getFullYear()} HackRadar</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="/about" className="transition-colors hover:text-white">
              About
            </a>
            <a href="/#top" className="transition-colors hover:text-white">
              Back to top
            </a>
          </div>
        </div>
        <div className="mt-10 h-[calc(var(--footer-wordmark-size)*0.5)] overflow-hidden [--footer-wordmark-size:clamp(4rem,17vw,15rem)] sm:mt-12">
          <a
            href="/"
            aria-label="HackRadar home"
            className="mx-auto block w-fit max-w-full text-center font-display text-[length:var(--footer-wordmark-size)] font-extrabold leading-none tracking-[-0.055em] text-lime outline-none transition-colors hover:text-cyan focus-visible:text-cyan"
          >
            HackRadar
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  return (
    <nav aria-label={`${title} footer links`}>
      <h2 className="mb-5 text-base font-semibold text-white">{title}</h2>
      <ul className="flex flex-col items-start gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="text-sm leading-6 text-white/75 transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
