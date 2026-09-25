export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(value)

export const formatPercentage = (value) => `${value}%`

export const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
