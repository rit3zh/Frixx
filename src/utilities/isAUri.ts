import is_url from "is-url";
/**
 * @param query The specified query to look on.
 */
export default function isURI(query: string) {
  if (!query) throw new RangeError(`No query specified.`);
  return is_url(query);
}
