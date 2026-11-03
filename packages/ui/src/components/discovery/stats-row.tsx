"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarDays, Code2, Users, UsersRound } from "lucide-react";

type Statistic = {
  icon: ReactNode;
  label: string;
  target: number;
  finalValue: string;
  format: (value: number) => string;
};

const statistics: Statistic[] = [
  {
    icon: <CalendarDays />,
    label: "Hackathons",
    target: 1248,
    finalValue: "1,248+",
    format: (value) => `${Math.floor(value).toLocaleString("en-US")}+`,
  },
  {
    icon: <UsersRound />,
    label: "Community Members",
    target: 500,
    finalValue: "500K+",
    format: (value) => `${Math.floor(value)}K+`,
  },
  {
    icon: <Code2 />,
    label: "Countries",
    target: 50,
    finalValue: "50+",
    format: (value) => `${Math.floor(value)}+`,
  },
  {
    icon: <Users />,
    label: "Developers",
    target: 100,
    finalValue: "100K+",
    format: (value) => `${Math.floor(value)}K+`,
  },
];

export function StatsRow() {
  return (
    <div className="mx-auto mt-6 grid w-full max-w-[1040px] grid-cols-2 gap-x-3 gap-y-4 text-left sm:gap-x-6 md:grid-cols-4 lg:mt-8 lg:gap-x-8">
      {statistics.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function Stat({ icon, label, target, finalValue, format }: Statistic) {
  const statRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(target);

  useEffect(() => {
    const node = statRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return;
        started = true;
        observer.disconnect();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setCount(target);
          return;
        }

        const startTime = performance.now();
        const duration = 700;
        setCount(0);
        const animate = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(target * eased));
          if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div
      ref={statRef}
      className="group flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-4"
    >
      <span className="grid size-10 shrink-0 sm:size-12 lg:size-14 place-items-center rounded-2xl border border-cyan bg-cyan text-on-cyan transition-colors duration-200 group-hover:bg-cyan motion-reduce:transition-none [&>svg]:size-6 [&>svg]:stroke-[2]">
        <span className="transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none">
          {icon}
        </span>
      </span>
      <p className="flex min-w-0 flex-col gap-1">
        <b
          aria-label={finalValue}
          className="text-[20px] leading-none font-extrabold tracking-[-0.4px] text-primary-strong sm:text-[21px]"
        >
          {count === target ? finalValue : format(count)}
        </b>
        <span className="text-[12px] leading-4 text-muted sm:text-[13px]">
          {label}
        </span>
      </p>
    </div>
  );
}
