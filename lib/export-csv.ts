export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`

export function capitalToCsv(data: { monthlyIncome: number; savings: number; target: number }) {
  const rows = [
    ['Monthly Income', 'Savings', 'Target'],
    [data.monthlyIncome, data.savings, data.target].map(String),
  ]
  return rows.map((r) => r.join(',')).join('\n')
}

export function studyToCsv(topics: { topic: string; hours: number; date: string }[]) {
  const rows = [['Topic', 'Hours', 'Date'], ...topics.map((t) => [escape(t.topic), t.hours, escape(t.date)])]
  return rows.map((r) => r.join(',')).join('\n')
}

export function marketToCsv(data: {
  stores: { name: string; notes: string }[]
  competitors: { name: string; notes: string }[]
  suppliers: { name: string; notes: string }[]
}) {
  const rows = [['Category', 'Name', 'Notes']]
  data.stores.forEach((i) => rows.push(['Store', escape(i.name), escape(i.notes || '')]))
  data.competitors.forEach((i) => rows.push(['Competitor', escape(i.name), escape(i.notes || '')]))
  data.suppliers.forEach((i) => rows.push(['Supplier', escape(i.name), escape(i.notes || '')]))
  return rows.map((r) => r.join(',')).join('\n')
}

export function financialToCsv(data: {
  costPerUnit: number
  sellingPrice: number
  monthlyFixedCosts: number
  unitsSoldPerMonth: number
}) {
  const margin = data.sellingPrice > 0 ? data.sellingPrice - data.costPerUnit : 0
  const marginPct = data.sellingPrice > 0 ? ((margin / data.sellingPrice) * 100).toFixed(1) : '0'
  const revenue = data.unitsSoldPerMonth * data.sellingPrice
  const cost = data.unitsSoldPerMonth * data.costPerUnit
  const profit = revenue - cost - data.monthlyFixedCosts
  const breakEven =
    data.monthlyFixedCosts > 0 && margin > 0 ? Math.ceil(data.monthlyFixedCosts / margin) : 0
  const rows = [
    ['Metric', 'Value'],
    ['Cost per Unit', data.costPerUnit],
    ['Selling Price', data.sellingPrice],
    ['Monthly Fixed Costs', data.monthlyFixedCosts],
    ['Units Sold/Month', data.unitsSoldPerMonth],
    ['Gross Margin', `${margin} (${marginPct}%)`],
    ['Monthly Revenue', revenue],
    ['Monthly Cost', cost],
    ['Monthly Profit', profit],
    ['Break-Even Units', breakEven],
  ]
  return rows.map((r) => r.join(',')).join('\n')
}

export function disciplineToCsv(habits: { name: string; checkedDays: boolean[]; habitFormed: boolean; startDate: string }[]) {
  const rows = [['Habit', 'Days Done', 'Total Days', 'Habit Formed', 'Start Date']]
  habits.forEach((h) => {
    const done = (h.checkedDays || []).filter(Boolean).length
    rows.push([escape(h.name), String(done), '21', h.habitFormed ? 'Yes' : 'No', escape(h.startDate)])
  })
  return rows.map((r) => r.join(',')).join('\n')
}
