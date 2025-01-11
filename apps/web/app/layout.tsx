import { GoogleAnalytics } from "~/components/shared/google-analytics";
import RootLayoutWrapper from "~/components/shared/layout/layout-helpers/root-layout-wrapper";
import { Providers } from "~/components/shared/layout/providers";
import "./css/globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "KindFi",
  description:
    "The first Web3 platform connecting supporters to impactful causes while driving blockchain adoption for social and environmental change",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>
          <RootLayoutWrapper>{children}</RootLayoutWrapper>
        </Providers>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-52DWMZ7R1H" />
      </body>
    </html>
  );
}
