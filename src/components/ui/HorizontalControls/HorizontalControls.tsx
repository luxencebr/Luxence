"use client";

import styles from "./HorizontalControls.module.css";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

interface HorizontalControlsProps {
  pageIndex: number;
  totalPages: number;
  prevPage: () => void;
  nextPage: () => void;
}

function HorizontalControls({
  pageIndex,
  totalPages,
  prevPage,
  nextPage,
}: HorizontalControlsProps) {
  return (
    <div className={styles.controls}>
      <button className={styles.scrollButtonLeft} onClick={prevPage}>
        <IoChevronBackOutline />
      </button>

      <button className={styles.scrollButtonRight} onClick={nextPage}>
        <IoChevronForwardOutline />
      </button>
    </div>
  );
}

export default HorizontalControls;
