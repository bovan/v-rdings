import { nb } from "date-fns/locale";
import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  setDefaultOptions,
} from "date-fns";

setDefaultOptions({ locale: nb });

const defaultFormatOptions = {
  addSuffix: true,
  strict: false,
};

export function formatDate(
  dateString: string | null | undefined,
  options = defaultFormatOptions,
): string {
  if (!dateString) {
    return "--";
  }
  const recentDate = new Date(dateString);
  const opts = { addSuffix: options.addSuffix };
  if (options.strict) {
    return formatDistanceToNowStrict(recentDate, opts);
  }
  return formatDistanceToNow(recentDate, opts);
}
