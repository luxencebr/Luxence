import styles from "./Footer.module.css";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

function Footer() {
  const { locale } = useSiteLocale();
  return (
    <footer className={styles.footer}>
      <div className="">
        <p>&copy; {new Date().getFullYear()} Luxence. {uiText(locale, "All rights reserved.")}</p>
      </div>
    </footer>
  );
}

export default Footer;
