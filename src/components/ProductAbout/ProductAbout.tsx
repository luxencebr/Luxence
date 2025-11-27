import styles from "./ProductAbout.module.css";
import { IoSchool } from "react-icons/io5";
import { IoLanguage, IoFlag } from "react-icons/io5";

import { Producer } from "@/types/Producer";

interface ProductAboutProps {
  producer: Producer;
  canEdit: boolean;
}

export default function ProductAbout({ producer, canEdit }: ProductAboutProps) {
  return (
    <section className={styles.producerHistory}>
      <h2>Sobre Mim</h2>
      <p>&quot;{producer.profile.description}&quot;</p>

      <div className={styles.topics}>
        <div className={styles.topic}>
          <span className={styles.icon}>
            <IoFlag />
          </span>
          {producer.nationality}
        </div>

        <div className={styles.topic}>
          <span className={styles.icon}>
            <IoLanguage />
          </span>
          {Array.isArray(producer.profile.languages) &&
          producer.profile.languages.length > 0 ? (
            producer.profile.languages.map((language, index) => (
              <span key={index} className={styles.languageTag}>
                {language.name} - {language.level}
              </span>
            ))
          ) : (
            <span className={styles.languageTag}>Não informado</span>
          )}
        </div>
        <div className={styles.topic}>
          <span className={styles.icon}>
            <IoSchool />
          </span>
          {producer.profile.scholarity}
        </div>
      </div>
    </section>
  );
}
