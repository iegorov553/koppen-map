import React from "react";
import { Card } from "./Card";
import styles from "./Legend.module.css";

export const Legend: React.FC<{ legendTitle?: string }> = ({ children, legendTitle = "Legend:" }) => {
  const [isOpen, isOpenSet] = React.useState(false);
  return (
    <Card className={styles.legend}>
      <div className={styles.toggleWrapper}>
        <button className={styles.toggle} onClick={() => isOpenSet(!isOpen)}>
          {isOpen ? "⬇️" : "⬆️"}
        </button>
      </div>
      {isOpen ? (
        <div className={`${styles.legendContent}`}>
          <h2 className={styles.header}>{legendTitle}</h2>{" "}
          <div className={`${styles.legendRow} ${styles.legendRowSm}`}>
            {children}
          </div>
        </div>
      ) : null}
    </Card>
  );
};
