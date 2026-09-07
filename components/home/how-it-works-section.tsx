import { Car, ClipboardList, KeyRound } from 'lucide-react'

import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/motion/primitives'
import { SectionHead } from '@/components/home/section-head'

const STEPS = [
  {
    icon: <Car className="size-5" aria-hidden />,
    title: 'Zgjidh makinën',
    desc: 'Shfleto flotën dhe kontrollo datat e lira në kalendar.',
  },
  {
    icon: <ClipboardList className="size-5" aria-hidden />,
    title: 'Rezervo online',
    desc: 'Plotëso të dhënat dhe konfirmo rezervimin — pa parapagesë.',
  },
  {
    icon: <KeyRound className="size-5" aria-hidden />,
    title: 'Merre dhe udhëto',
    desc: 'Vjen te pika e marrjes, merr çelësat dhe nis rrugën — pa pritje.',
  },
] as const

export function HowItWorksSection() {
  return (
    <section
      id="si-funksionon"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-16"
    >
      <Reveal className="panel px-6 py-12 sm:px-10 sm:py-14">
        <SectionHead eyebrow="Si funksionon" title="Tre hapa deri te timoni" />
        <StaggerGroup
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3"
          stagger={0.1}
        >
          {STEPS.map((step, i) => (
            <StaggerItem
              key={step.title}
              className="shadow-soft relative flex flex-col gap-4 rounded-[28px] bg-white p-7 ring-1 ring-black/[0.03]"
            >
              <div className="flex items-center justify-between">
                <span className="text-brand flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
                  {step.icon}
                </span>
                <span className="text-brand/15 text-4xl font-semibold">
                  0{i + 1}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
                  {step.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>
    </section>
  )
}
