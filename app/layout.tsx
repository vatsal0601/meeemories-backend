import "./globals.css";

import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata = {
  title: "Meeeemories Backend",
  description: "A project by @vatsal0601",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
};

export default Layout;
