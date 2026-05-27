type Props = {
  steps: string[]
  current: number // 0-based index
}

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-2 mb-8 text-sm">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current

        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">›</span>}
            <span
              className={`flex items-center gap-1.5 font-medium ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  done
                    ? 'bg-primary/15 text-primary'
                    : active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
