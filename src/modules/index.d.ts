declare module "youtube-url" {
  function valid(url?: string): boolean;
  function extractId(url?: string): string;
  export default { valid, extractId };
}
