import Card from "@/components/ui/Card/Card";
import styles from "./ProfileSkeleton.module.css";

export default function ProfileSkeleton() {
  return (
    <div className={`${styles.container} scrollbar`}>
      <div className={styles.content}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} backgroundColor="var(--dark-complementary-color)">
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <div className={styles.titleSkeleton} />
                <div className={styles.buttonSkeleton} />
              </div>
              <div className={styles.valueSkeleton} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
