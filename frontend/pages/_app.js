import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";
import useMarketingStudioStore from "../store/useMarketingStudioStore";
import { useAuth } from "../hooks/useAuth";

export default function App({ Component, pageProps }) {
  const { accentColor, grayColor, radius } = useMarketingStudioStore();
  const auth = useAuth();

  if (!auth) return null;

  return (
    <>
      <Head>
        <title>Zava Marketing Studio</title>
      </Head>
      <Theme accentColor={accentColor} grayColor={grayColor} radius={radius}>
        <Component {...pageProps} />
        <ToastContainer position="bottom-right" />
      </Theme>
    </>
  );
}
