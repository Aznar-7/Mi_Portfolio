import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TechTag } from '@/components/common/TechTag'
import { skillGroups } from '@/data/skills'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

export function Skills() {
  const { lang } = useLang()
  const T = translations[lang].skills

  return (
    <SectionWrapper id="skills">
      <SectionHeading title={T.title} subtitle={T.subtitle} />
      <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {skillGroups.map((group) => (
          <div key={group.id} className="grid gap-4 py-6 md:grid-cols-[12rem_1fr] md:gap-10">
            <dt className="text-sm font-medium text-[var(--text-primary)] md:pt-2">{l(group.label, lang)}</dt>
            <dd className="flex flex-wrap gap-2">
              {group.items.map((name) => <TechTag key={name} name={name} size="md" />)}
            </dd>
          </div>
        ))}
      </dl>
    </SectionWrapper>
  )
}
