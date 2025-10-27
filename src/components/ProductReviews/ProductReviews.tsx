"use client";

import { useState } from "react";
import styles from "./ProductReviews.module.css";
import { FaHeart } from "react-icons/fa6";

import type { Producer } from "../../types/Producer";
import type { ProducerReview } from "../../types/ProducerReview";

interface ProductReviewsProps {
  producer: Producer;
}

function ProductReviews({ producer }: ProductReviewsProps) {
  const reviews = producer.reviews || [];
  const hasReviews = reviews.length > 0;

  const rating = hasReviews
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  const [visibleCount, setVisibleCount] = useState(3);

  const visibleReviews = hasReviews ? reviews.slice(0, visibleCount) : [];

  const showMore = () => setVisibleCount(reviews.length);
  const showLess = () => setVisibleCount(3);

  return (
    <section id="reviews" className={styles.productReviews}>
      <div className={styles.layout}>
        <div className={styles.header}>
          <h2>{reviews.length} Avaliações</h2>
          <span className={styles.ratingValue}>
            <span>
              <FaHeart />
            </span>
            {typeof rating === "number" && !isNaN(rating)
              ? rating.toFixed(1)
              : "N/D"}
          </span>
        </div>

        <ul className={styles.reviewsList}>
          {hasReviews ? (
            visibleReviews.map((review: ProducerReview) => (
              <li key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewItemLayout}>
                  <div className={styles.reviewInfo}>
                    <p className={styles.reviewerName}>
                      {review.userName || `Cliente ${review.userId.slice(-4)}`}
                    </p>
                    <span className={styles.rate}>({review.rating} / 5)</span>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                  <span className={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className={styles.noReviews}>
              <p>Este produtor ainda não possui avaliações.</p>
            </li>
          )}
        </ul>

        {hasReviews && reviews.length > 3 && (
          <button
            className={styles.showMoreButton}
            onClick={visibleCount < reviews.length ? showMore : showLess}
          >
            {visibleCount < reviews.length ? "Ver mais" : "Ver menos"}
          </button>
        )}
      </div>

      <div className={`${styles.layout} ${styles.user}`}>
        <div className={styles.userReview}>
          <div className={styles.producerCall}>
            <img src={producer.profile.images[1]} alt="" />
            <p>O que achou do nosso encontro, amor?</p>
          </div>
          <textarea
            placeholder="Deixe seu comentário..."
            className={styles.commentInput}
            rows={1}
            onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
              const target = e.currentTarget;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default ProductReviews;
