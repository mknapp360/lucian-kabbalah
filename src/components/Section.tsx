import type { ReactNode } from 'react'

interface SectionProps {
  number?: string
  title?: string
  children: ReactNode
  className?: string
}

export default function Section({ number, title, children, className = '' }: SectionProps) {
  return (
    <section className={`py-12 md:py-18 ${className}`}>
      <div className="max-w-content mx-auto px-6 md:px-10">
        {(number || title) && (
          <div className="mb-8 md:mb-12">
            {number && <p className="section-number mb-3">{number}</p>}
            {title && (
              <h2 className="font-serif text-heading-2 text-parchment-100 font-light">
                {title}
              </h2>
            )}
          </div>
        )}
        <div className="prose-scholarly">{children}</div>
      </div>
    </section>
  )
}
