"use client";

import { useState } from "react";
import styles from "./verification-step.module.css";

interface VerificationStepProps {
  formData: any;
  onUpdate: (data: any) => void;
}

export default function VerificationStep({
  formData,
  onUpdate,
}: VerificationStepProps) {
  const [previewProfile, setPreviewProfile] = useState<string | null>(
    formData.profilePhoto || null
  );
  const [previewDocument, setPreviewDocument] = useState<string | null>(
    formData.documentPhoto || null
  );

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "profilePhoto" | "documentPhoto",
    setPreview: (url: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
      onUpdate({ [field]: file });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Verificação</h2>
        <p className={styles.subtitle}>
          Precisamos nos certificar de sua identidade
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.uploadBox}>
          <label className={styles.label}>Foto de Perfil</label>
          {previewProfile ? (
            <div className={styles.previewWrapper}>
              <img
                src={previewProfile}
                alt="Foto de perfil"
                className={styles.previewImage}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  setPreviewProfile(null);
                  onUpdate({ profilePhoto: null });
                }}
              >
                Remover
              </button>
            </div>
          ) : (
            <>
              <label htmlFor="profile-upload" className={styles.customUpload}>
                <span>Enviar Foto</span>
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e, "profilePhoto", setPreviewProfile)
                }
              />
            </>
          )}
        </div>

        <div className={styles.uploadBox}>
          <label className={styles.label}>Foto com Documento</label>
          {previewDocument ? (
            <div className={styles.previewWrapper}>
              <img
                src={previewDocument}
                alt="Foto com documento"
                className={styles.previewImage}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  setPreviewDocument(null);
                  onUpdate({ documentPhoto: null });
                }}
              >
                Remover
              </button>
            </div>
          ) : (
            <>
              <label htmlFor="document-upload" className={styles.customUpload}>
                <span>Enviar Foto</span>
              </label>
              <input
                id="document-upload"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e, "documentPhoto", setPreviewDocument)
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
