/**
 * Helper utility to build Facebook Page Plugin iframe URL
 * Provides a deterministic, reliable embed approach for desktop/tablet viewports
 */

export interface FacebookPagePluginOptions {
  pageUrl: string;
  tabs?: string;
  width?: number;
  height?: number;
  smallHeader?: boolean;
  adaptContainerWidth?: boolean;
  hideCover?: boolean;
  showFacepile?: boolean;
}

/**
 * Builds the Facebook Page Plugin iframe URL with the given options
 * @param options Configuration for the Facebook Page Plugin
 * @returns Complete iframe URL for embedding
 */
export function buildFacebookPagePluginUrl(options: FacebookPagePluginOptions): string {
  const {
    pageUrl,
    tabs = 'timeline',
    width = 500,
    height = 500,
    smallHeader = false,
    adaptContainerWidth = true,
    hideCover = false,
    showFacepile = true,
  } = options;

  const params = new URLSearchParams({
    href: pageUrl,
    tabs,
    width: width.toString(),
    height: height.toString(),
    small_header: smallHeader.toString(),
    adapt_container_width: adaptContainerWidth.toString(),
    hide_cover: hideCover.toString(),
    show_facepile: showFacepile.toString(),
  });

  return `https://www.facebook.com/plugins/page.php?${params.toString()}`;
}
