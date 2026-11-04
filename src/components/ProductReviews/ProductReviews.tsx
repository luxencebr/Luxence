"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "./ProductReviews.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import AuthRequiredPopup from "@/components/AuthRequiredPopup/AuthRequiredPopup";

import type { Producer } from "@/types/Producer";
import type { Review } from "@/types/Producer";
import { useSiteLocale } from "@/lib/site-locale";
import { uiText } from "@/lib/ui-text";

interface ProductReviewsProps {
  producer: Producer;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

function ProductReviews({
  producer,
  onLoginClick,
  onSignupClick,
}: ProductReviewsProps) {
  const { locale } = useSiteLocale();
  const t = (value: string) => uiText(locale, value);
  const { data: session } = useSession();

  const [reviews, setReviews] = useState<Review[]>(
    producer.profile.reviews || [],
  );
  const [visibleCount, setVisibleCount] = useState(3);

  const [userComment, setUserComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [userName, setUserName] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const [approvingReviewId, setApprovingReviewId] = useState<string | null>(
    null,
  );

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isProfileOwner =
    session?.user?.id && Number(session.user.id) === producer.userId;

  const approvedReviews = reviews.filter((review) => review.isApproved);

  const pendingReviews = reviews.filter((review) => !review.isApproved);

  const hasReviews = approvedReviews.length > 0;

  const rating = hasReviews
    ? approvedReviews.reduce((acc, review) => acc + review.rating, 0) /
      approvedReviews.length
    : 0;

  const visibleReviews = approvedReviews.slice(0, visibleCount);

  const showMore = () => setVisibleCount(approvedReviews.length);
  const showLess = () => setVisibleCount(3);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const userId = session?.user?.id || "";
        const response = await fetch(
          `/api/reviews?profileId=${producer.profile.id}&userId=${userId}`,
        );

        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Erro ao carregar reviews:", error);
      }
    };

    fetchReviews();
  }, [session, producer.profile.id]);

  useEffect(() => {
    if (session?.user?.id) {
      const userId = session.user.id;
      const existingReview = reviews.find(
        (review) => review.userId === Number(userId),
      );
      setUserHasReviewed(!!existingReview);
      setUserReview(existingReview || null);
    } else {
      setUserHasReviewed(false);
      setUserReview(null);
    }
  }, [session, reviews]);

  const handleAuthRequired = () => {
    if (!session) {
      setShowAuthPopup(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!session) {
      setShowAuthPopup(true);
      return;
    }

    if (userHasReviewed) {
      setError("Você avaliou este produtor");
      return;
    }

    setError("");
    setSuccess(false);

    if (!userRating) {
      setError("Por favor, selecione uma avaliação");
      return;
    }

    if (userComment.trim().length < 10) {
      setError(
        "O comentário é obrigatório e deve ter pelo menos 10 caracteres",
      );
      return;
    }

    const userId = session?.user?.id;
    const profileId = producer.profile.id;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          profileId,
          rating: userRating,
          comment: userComment.trim(),
          reviewerName: userName.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao enviar avaliação");
      }

      const newReview = await response.json();

      setReviews((prev) => [newReview, ...prev]);

      setUserComment("");
      setUserRating(0);
      setUserName("");
      setSuccess(true);
      setUserHasReviewed(true);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar avaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteReview = (reviewId: string) => {
    setDeletingReviewId(reviewId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteReview = async () => {
    if (!session?.user?.id || !deletingReviewId) return;

    try {
      const response = await fetch(
        `/api/reviews/${deletingReviewId}?userId=${session.user.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar avaliação");
      }

      setReviews((prev) => prev.filter((r) => r.id !== deletingReviewId));

      const deletedReview = reviews.find((r) => r.id === deletingReviewId);
      if (deletedReview?.userId === Number(session.user.id)) {
        setUserHasReviewed(false);
        setUserReview(null);
      }

      setShowDeleteConfirm(false);
      setDeletingReviewId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao deletar avaliação",
      );
      setShowDeleteConfirm(false);
      setDeletingReviewId(null);
    }
  };

  const handleApproveReview = async (reviewId: string, approve: boolean) => {
    if (!session?.user?.id || !isProfileOwner) return;

    setApprovingReviewId(reviewId);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          isApproved: approve,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar avaliação");
      }

      if (!approve) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        const updatedReview = await response.json();
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? updatedReview : r)),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar avaliação",
      );
    } finally {
      setApprovingReviewId(null);
    }
  };

  return (
    <section id="reviews" className={styles.productReviews}>
      <AuthRequiredPopup
        active={showAuthPopup}
        onActiveChange={setShowAuthPopup}
      />

      {showDeleteConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{t("Confirmar exclusão")}</h3>
            <p>{t("Tem certeza que deseja excluir esta avaliação?")}</p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancel}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingReviewId(null);
                }}
              >
                {t("Cancelar")}
              </button>
              <button
                className={styles.modalConfirm}
                onClick={handleDeleteReview}
              >
                {t("Excluir")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.header}>
          <h2>{approvedReviews.length} {t("Avaliações")}</h2>
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
          {approvedReviews.length > 0 ? (
            visibleReviews.map((review) => {
              const isOwnReview =
                session?.user?.id && review.userId === Number(session.user.id);

              return (
                <li key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewItemLayout}>
                    <div className={styles.reviewInfo}>
                      <p className={styles.reviewerName}>
                        {review.reviewerName || t("Anônimo")}
                      </p>
                    </div>
                    {review.comment && (
                      <p className={styles.reviewComment}>{review.comment}</p>
                    )}
                    <span className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString({ pt: "pt-BR", en: "en-US", es: "es-ES" }[locale])}
                    </span>

                    {(isOwnReview || isProfileOwner) && (
                      <button
                        className={styles.deleteButton}
                        onClick={() => confirmDeleteReview(review.id)}
                      >
                        {t("Remover avaliação")}
                      </button>
                    )}
                  </div>
                </li>
              );
            })
          ) : (
            <li className={styles.noReviews}>
              <p>{t("Este produtor ainda não possui avaliações.")}</p>
            </li>
          )}
        </ul>

        {approvedReviews.length > 3 && (
          <button
            className={styles.showMoreButton}
            onClick={
              visibleCount < approvedReviews.length ? showMore : showLess
            }
          >
            {t(visibleCount < approvedReviews.length ? "Ver mais" : "Ver menos")}
          </button>
        )}
      </div>

      {isProfileOwner ? (
        <div className={`${styles.layout} ${styles.user}`}>
          <div className={styles.userReview}>
            <div className={styles.producerCall}>
              <p>{t("Avaliações pendentes de aprovação")}</p>
            </div>

            {pendingReviews.length > 0 ? (
              <ul className={styles.pendingReviewsList}>
                {pendingReviews.map((review) => (
                  <li
                    key={review.id}
                    className={`${styles.reviewItem} ${styles.reviewPending}`}
                  >
                    <div className={styles.reviewItemLayout}>
                      <div className={styles.reviewInfo}>
                        <p className={styles.reviewerName}>
                          {review.reviewerName || t("Anônimo")}
                          <span className={styles.pendingBadge}>{t("Pendente")}</span>
                        </p>
                      </div>
                      {review.comment && (
                        <p className={styles.reviewComment}>{review.comment}</p>
                      )}
                      <span className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString({ pt: "pt-BR", en: "en-US", es: "es-ES" }[locale])}
                      </span>

                      <div className={styles.approvalButtons}>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApproveReview(review.id, true)}
                          disabled={approvingReviewId === review.id}
                        >
                          {t(approvingReviewId === review.id ? "Aprovando..." : "Aprovar")}
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleApproveReview(review.id, false)}
                          disabled={approvingReviewId === review.id}
                        >
                          {t(approvingReviewId === review.id ? "Rejeitando..." : "Rejeitar")}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noPendingReviews}>
                <p>{t("Nenhuma avaliação pendente no momento.")}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`${styles.layout} ${styles.user}`}>
          <div className={styles.userReview}>
            <div className={styles.producerCall}>
              <p>{t("O que achou do nosso encontro, amor?")}</p>
            </div>

            {userHasReviewed ? (
              <div className={styles.alreadyReviewedMessage}>
                <p>{t("✓ Você avaliou este produtor")}</p>
                {userReview && !userReview.isApproved && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      marginTop: "0.5rem",
                      color: "#ff9800",
                    }}
                  >
                    {t("Sua avaliação está em análise")}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className={styles.ratingLabel}>{t("Sua avaliação:")}</p>

                <div className={styles.flex}>
                  <label htmlFor="" className={styles.label}>
                    {t("Nome:")}
                    <input
                      type="text"
                      placeholder={
                        session
                          ? t("Deixe vazio para anônimo")
                          : t("Faça login para avaliar...")
                      }
                      className={styles.nameInput}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onFocus={handleAuthRequired}
                      disabled={isSubmitting || !session || userHasReviewed}
                      maxLength={50}
                    />
                  </label>

                  <label htmlFor="" className={styles.label}>
                    {t("Nota:")}
                    <div className={styles.hearts}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={styles.heartButton}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => {
                            if (!session) {
                              handleAuthRequired();
                            } else {
                              setUserRating(star);
                            }
                          }}
                          disabled={isSubmitting || userHasReviewed}
                        >
                          {star <= (hoveredRating || userRating) ? (
                            <FaHeart className={styles.heartFilled} />
                          ) : (
                            <FaRegHeart className={styles.heartEmpty} />
                          )}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>

                <label htmlFor="" className={styles.label}>
                  {t("Comentário:")}
                  <textarea
                    placeholder={
                      session
                        ? t("Deixe seu comentário (Mínimo 10 caracteres)...")
                        : t("Faça login para deixar um comentário...")
                    }
                    className={styles.commentInput}
                    rows={1}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                    onFocus={handleAuthRequired}
                    disabled={isSubmitting || !session || userHasReviewed}
                  />
                </label>

                {error && <p className={styles.errorMessage}>{error}</p>}
                {success && (
                  <p className={styles.successMessage}>
                    ✓ {t("Avaliação enviada com sucesso!")}
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {t("Sua avaliação entrará em análise pelo produtor.")}
                    </span>
                  </p>
                )}

                <button
                  className={styles.submitButton}
                  onClick={handleSubmitReview}
                  disabled={
                    isSubmitting || !session || !userRating || userHasReviewed
                  }
                >
                  {t(isSubmitting ? "Enviando..." : "Enviar avaliação")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductReviews;
