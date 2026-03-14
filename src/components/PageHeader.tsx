interface PageHeaderProps {
  number?: string
  title: string
  subtitle?: string
}

export default function PageHeader({ number, title, subtitle }: PageHeaderProps) {
  return (
    <div className="page-enter pt-18 md:pt-26 pb-12 md:pb-18">
      <div className="max-w-content mx-auto px-6 md:px-10">
        {number && (
          <p className="section-number mb-4">{number}</p>
        )}
        <h1 className="font-serif text-heading-1 md:text-display text-parchment-50 font-light">
          {title}
        </h1>
        {subtitle && (
          <>
            <div className="gold-rule-left max-w-24 mt-6 mb-6" />
            <p className="font-serif text-heading-3 text-warmgray-400 font-light italic max-w-prose">
              {subtitle}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
