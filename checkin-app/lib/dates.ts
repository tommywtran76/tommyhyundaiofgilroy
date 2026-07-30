const TZ = process.env.BUSINESS_TIMEZONE || "America/Los_Angeles";

/** Date parts of `d` in the business timezone. */
function tzParts(d: Date): { y: number; m: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, day] = fmt.format(d).split("-").map(Number);
  return { y, m, day };
}

/** UTC offset (ms) of the business timezone at instant `d`. */
function tzOffsetMs(d: Date): number {
  const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
  return utc.getTime() - local.getTime();
}

/** Start of the business day (midnight in the salon's timezone) containing `d`. */
export function startOfBusinessDay(d: Date = new Date()): Date {
  const { y, m, day } = tzParts(d);
  const approx = new Date(Date.UTC(y, m - 1, day));
  return new Date(approx.getTime() + tzOffsetMs(approx));
}

export function daysAgo(n: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - n * 24 * 60 * 60 * 1000);
}

export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Current month number (1-12) in the business timezone — for birthday reports. */
export function currentBusinessMonth(): number {
  return tzParts(new Date()).m;
}

/** Parse ?from=YYYY-MM-DD&to=YYYY-MM-DD into a UTC range covering business days. */
export function parseDateRange(from?: string | null, to?: string | null): { gte: Date; lte: Date } {
  const now = new Date();
  const gte = from && /^\d{4}-\d{2}-\d{2}$/.test(from)
    ? businessMidnight(from)
    : daysAgo(30, startOfBusinessDay(now));
  const lte = to && /^\d{4}-\d{2}-\d{2}$/.test(to)
    ? new Date(businessMidnight(to).getTime() + 24 * 60 * 60 * 1000 - 1)
    : now;
  return { gte, lte };
}

function businessMidnight(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const approx = new Date(Date.UTC(y, m - 1, d));
  return new Date(approx.getTime() + tzOffsetMs(approx));
}
