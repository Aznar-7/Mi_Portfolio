import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ArchitectureFlow } from '@/components/common/ArchitectureFlow'
import { processSteps } from '@/data/process'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

// The delivery cycle drawn with the same trace as the UTN Hub request flow:
// a signal moves stage to stage, each stop backed by a real project
const stops = processSteps.map((s) => ({ id: s.id, name: s.title, tech: s.project, detail: s.detail, note: s.example }))

export function Process() {
  const { lang } = useLang()
  const T = translations[lang].process

  return (
    <SectionWrapper id="process">
      <SectionHeading title={T.title} subtitle={T.subtitle} />
      <ArchitectureFlow flow={stops} lang={lang} title={T.flow_label} hint={T.flow_hint} />
    </SectionWrapper>
  )
}
