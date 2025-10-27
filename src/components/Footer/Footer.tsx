import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="">
        <p>&copy; {new Date().getFullYear()} Exence. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
