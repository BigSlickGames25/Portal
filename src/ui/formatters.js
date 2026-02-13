const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const preciseCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

function formatMetric(value, format) {
  if (format === "currency") {
    return currencyFormatter.format(value);
  }
  if (format === "percent") {
    return `${percentFormatter.format(value)}%`;
  }
  if (format === "percentPrecise") {
    return `${Number(value).toFixed(2)}%`;
  }
  if (format === "decimalCurrency") {
    return preciseCurrencyFormatter.format(value);
  }
  return compactFormatter.format(value);
}

export {
  compactFormatter,
  currencyFormatter,
  preciseCurrencyFormatter,
  percentFormatter,
  formatMetric
};
