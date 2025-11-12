"use client";

import { useEffect, useState } from "react";
import styles from "./verification-step.module.css";

interface VerificationStepProps {
  formData: any;
  onUpdate: (data: any) => void;
  onValidate?: (isValid: boolean) => void;
}

export default function VerificationStep({
  formData,
  onUpdate,
  onValidate,
}: VerificationStepProps) {
  const [previewProfile, setPreviewProfile] = useState<string | null>(
    formData.profilePhoto ? URL.createObjectURL(formData.profilePhoto) : null
  );
  const [previewDocument, setPreviewDocument] = useState<string | null>(
    formData.documentPhoto ? URL.createObjectURL(formData.documentPhoto) : null
  );

  const [isValid, setIsValid] = useState(false);

  // Erros de validação local
  const [profileError, setProfileError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);

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

      // Limpa erros ao enviar o arquivo
      if (field === "profilePhoto") setProfileError(null);
      if (field === "documentPhoto") setDocumentError(null);
    }
  };

  // Validação automática quando formData muda
  useEffect(() => {
    if (!formData.profilePhoto) setProfileError("Envie uma foto de perfil.");
    else setProfileError(null);

    if (!formData.documentPhoto)
      setDocumentError("Envie uma foto com documento.");
    else setDocumentError(null);
  }, [formData.profilePhoto, formData.documentPhoto]);

  useEffect(() => {
    const valid = !!formData.profilePhoto && !!formData.documentPhoto;
    setIsValid(valid);
    onValidate?.(valid);
  }, [formData.profilePhoto, formData.documentPhoto, onValidate]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Verificação</h2>
        <p className={styles.subtitle}>
          Envie suas fotos para confirmar sua identidade.
        </p>
      </div>

      <div className={styles.section}>
        {/* Foto de Perfil */}
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
          {profileError && (
            <small className={styles.error}>{profileError}</small>
          )}
        </div>

        {/* Foto com Documento */}
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
          {documentError && (
            <small className={styles.error}>{documentError}</small>
          )}
        </div>
      </div>
      {!isValid && (
        <p style={{ color: "orange", margin: 0 }}>
          ⚠ Preencha corretamente as informações
        </p>
      )}
    </div>
  );
}
