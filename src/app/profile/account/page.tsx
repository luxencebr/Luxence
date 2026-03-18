"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card/Card";
import LoadingContainer from "@/components/ui/LoadingContainer/LoadingContainer";
import styles from "./account.module.css";

interface AddressData {
  cep: string;
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  complement: string;
}

export default function AccountPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvertiser, setIsAdvertiser] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [address, setAddress] = useState<AddressData>({
    cep: "",
    country: "Brasil",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [originalAddress, setOriginalAddress] = useState<AddressData>({
    cep: "",
    country: "Brasil",
    state: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
  });
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  // Estados para verificação de email
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Validação de email
  const validateEmail = (email: string) => {
    if (!email) return { valid: false, reason: "Informe o email" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return { valid: false, reason: "Email inválido" };
    return { valid: true, reason: "" };
  };

  // Auto-verificar quando o código for digitado completamente
  useEffect(() => {
    if (emailVerificationCode.length === 6 && codeSent && !verifyingCode) {
      handleVerifyCode();
    }
  }, [emailVerificationCode]);

  // Handler para Enter key
  const handleKeyPress = (
    e: React.KeyboardEvent,
    field: keyof typeof formData | "address" | "emailCode",
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (field === "emailCode" && codeSent) {
        handleVerifyCode();
      } else if (field === "address") {
        if (!address.cep || !address.number) return;
        handleSave("address");
      } else if (field === "email" && isEditing.email && !codeSent) {
        handleSendVerificationCode();
      } else if (isEditing[field as keyof typeof isEditing]) {
        handleSave(field as keyof typeof formData);
      }
    }
  };

  // Verificar se email já está cadastrado
  const checkEmailExists = async (email: string) => {
    const validation = validateEmail(email);
    if (!validation.valid) {
      setCodeError(validation.reason);
      return false;
    }

    setEmailChecking(true);
    setCodeError(null);
    try {
      const res = await fetch(
        `/api/register/check-email?email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();
      setEmailExists(data.exists);

      if (data.exists) {
        setCodeError("Este email já está cadastrado");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Erro ao verificar email", err);
      setCodeError("Erro ao verificar email");
      return false;
    } finally {
      setEmailChecking(false);
    }
  };

  useEffect(() => {
    if (!newEmail || !isEditing.email) return;

    const validation = validateEmail(newEmail);
    if (!validation.valid) return;

    const timer = setTimeout(() => {
      checkEmailExists(newEmail);
    }, 500);

    return () => clearTimeout(timer);
  }, [newEmail, isEditing.email]);

  const handleSendVerificationCode = async () => {
    // Etapa 0: Email é válido?
    const emailValidation = validateEmail(newEmail);
    if (!emailValidation.valid) {
      setCodeError(emailValidation.reason);
      return;
    }

    // Etapa 1: Email já está cadastrado?
    const isAvailable = await checkEmailExists(newEmail);
    if (!isAvailable) {
      return;
    }

    setSendingCode(true);
    setCodeError(null);

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar código");
      }

      // Etapa 2: Código enviado para verificação
      setCodeSent(true);
    } catch (err) {
      setCodeError(
        err instanceof Error ? err.message : "Erro ao enviar código",
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!emailVerificationCode || emailVerificationCode.length !== 6) {
      setCodeError("Digite o código de 6 dígitos");
      return;
    }

    setVerifyingCode(true);
    setCodeError(null);

    try {
      // Etapa 2: Verificar se o email é seu
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          code: emailVerificationCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Código inválido");
      }

      // Etapa 3: Tudo ok, alterar
      await handleSaveEmail();

      // Resetar estados
      setCodeSent(false);
      setEmailVerificationCode("");
      setNewEmail("");
      setIsEditing((prev) => ({ ...prev, email: false }));
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSaveEmail = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar email");
      }

      setFormData((prev) => ({ ...prev, email: newEmail }));
      setOriginalData((prev) => ({ ...prev, email: newEmail }));
    } catch (error) {
      console.error("Erro ao salvar:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendCode = async () => {
    if (!newEmail) {
      setCodeError("Email é obrigatório");
      return;
    }

    setSendingCode(true);
    setCodeError(null);
    setEmailVerificationCode("");

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao reenviar código");
      }
    } catch (err) {
      setCodeError(
        err instanceof Error ? err.message : "Erro ao reenviar código",
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleChangeEmail = () => {
    setCodeSent(false);
    setEmailVerificationCode("");
    setCodeError(null);
  };

  const handleCancelEmailEdit = () => {
    setIsEditing((prev) => ({ ...prev, email: false }));
    setCodeSent(false);
    setEmailVerificationCode("");
    setCodeError(null);
    setEmailExists(false);
    setEmailChecking(false);
    setNewEmail("");
  };

  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    setCodeError(null);
    setEmailExists(false);
  };

  const handleEditEmail = () => {
    setIsEditing((prev) => ({ ...prev, email: true }));
    setNewEmail("");
  };

  useEffect(() => {
    const fetchAccountData = async () => {
      setIsLoading(true);
      try {
        // Delay mínimo para evitar flickering em conexões rápidas
        const [response] = await Promise.all([
          fetch("/api/profile/account"),
          new Promise((resolve) => setTimeout(resolve, 300)),
        ]);

        if (response.ok) {
          const data = await response.json();
          const accountData = {
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          };
          setFormData(accountData);
          setOriginalData(accountData);
          setIsAdvertiser(data.isAdvertiser || false); // Definir se é anunciante

          if (data.locality) {
            const addressData: AddressData = {
              cep: data.locality.cep || "",
              country: data.locality.country || "Brasil",
              state: data.locality.state || "",
              city: data.locality.city || "",
              neighborhood: data.locality.neighborhood || "",
              street: data.locality.street || "",
              number: data.locality.number || "",
              complement: data.locality.complement || "",
            };
            setAddress(addressData);
            setOriginalAddress(addressData);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchAccountData();
    }
  }, [session]);

  const fetchCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        alert("CEP não encontrado");
        return;
      }

      setAddress((prev) => ({
        ...prev,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));
    } catch (err) {
      console.error("Erro buscando CEP:", err);
      alert("Erro ao buscar CEP");
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleEdit = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    if (field === "address") {
      setAddress(originalAddress);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: originalData[field as keyof typeof originalData],
      }));
    }
  };

  const handleSave = async (field: keyof typeof formData | "address") => {
    setIsSaving(true);
    try {
      const body =
        field === "address"
          ? { address }
          : { [field]: formData[field as keyof typeof formData] };

      const response = await fetch("/api/profile/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar dados");
      }

      setIsEditing((prev) => ({ ...prev, [field]: false }));

      if (field === "address") {
        setOriginalAddress(address);
      } else {
        setOriginalData((prev) => ({
          ...prev,
          [field]: formData[field as keyof typeof formData],
        }));
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (field === "cep") {
      fetchCEP(value);
    }
  };

  const formatAddress = () => {
    if (!address.street && !address.city) return "Não informado";
    const parts = [
      address.street,
      address.number && `nº ${address.number}`,
      address.complement,
      address.neighborhood,
      address.city,
      address.state,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <>
      {isLoading ? (
        <LoadingContainer message="Carregando dados da conta..." />
      ) : (
        <div className={styles.container}>
          <div className={styles.content}>
            <Card backgroundColor="var(--dark-complementary-color)">
              <div
                className={`${styles.cardContent} ${!isEditing.name ? styles.clickableCard : ""}`}
                onClick={!isEditing.name ? () => handleEdit("name") : undefined}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <div>
                      <h3 className={styles.cardTitle}>Editar Nome</h3>
                    </div>
                  </div>
                  {isEditing.name && (
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleSave("name")}
                        disabled={isSaving}
                        className={styles.saveButton}
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => handleCancel("name")}
                        disabled={isSaving}
                        className={styles.cancelButton}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                {isEditing.name ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "name")}
                    className={styles.input}
                    placeholder="Digite seu nome"
                    autoFocus
                  />
                ) : (
                  <p className={styles.value}>
                    {formData.name || "Não informado"}
                  </p>
                )}
              </div>
            </Card>

            <Card backgroundColor="var(--dark-complementary-color)">
              <div
                className={`${styles.cardContent} ${!isEditing.email ? styles.clickableCard : ""}`}
                onClick={!isEditing.email ? () => handleEditEmail() : undefined}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <div>
                      <h3 className={styles.cardTitle}>Alterar E-mail</h3>
                    </div>
                  </div>
                  {isEditing.email && (
                    <div className={styles.actions}>
                      {codeSent ? (
                        <>
                          <button
                            onClick={handleResendCode}
                            disabled={sendingCode || verifyingCode}
                            className={styles.saveButton}
                          >
                            {sendingCode ? "Reenviando..." : "Reenviar código"}
                          </button>
                          <button
                            onClick={handleChangeEmail}
                            disabled={verifyingCode}
                            className={styles.cancelButton}
                          >
                            Trocar email
                          </button>
                          <button
                            onClick={handleCancelEmailEdit}
                            disabled={verifyingCode}
                            className={styles.cancelButton}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleSendVerificationCode}
                            disabled={
                              sendingCode ||
                              emailChecking ||
                              emailExists ||
                              !newEmail ||
                              validateEmail(newEmail).valid === false
                            }
                            className={styles.saveButton}
                          >
                            {sendingCode ? "Enviando..." : "Enviar código"}
                          </button>
                          <button
                            onClick={handleCancelEmailEdit}
                            disabled={sendingCode}
                            className={styles.cancelButton}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {isEditing.email ? (
                  codeSent ? (
                    <div className={styles.codeVerification}>
                      <input
                        type="text"
                        value={emailVerificationCode}
                        onChange={(e) =>
                          setEmailVerificationCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        onKeyPress={(e) => handleKeyPress(e, "emailCode")}
                        className={styles.input}
                        placeholder="Digite o código de 6 dígitos"
                        maxLength={6}
                        autoFocus
                      />
                      {verifyingCode && (
                        <p className={styles.loading}>Verificando código...</p>
                      )}
                      {codeError && (
                        <p className={styles.codeError}>{codeError}</p>
                      )}
                      <p className={styles.codeSentText}>
                        Um código foi enviado para <strong>{newEmail}</strong>
                      </p>
                    </div>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, "email")}
                        className={styles.input}
                        placeholder="Digite seu novo e-mail"
                        autoFocus
                      />
                      {emailChecking && (
                        <p className={styles.loading}>Verificando email...</p>
                      )}
                      {codeError && (
                        <p className={styles.codeError}>{codeError}</p>
                      )}
                    </>
                  )
                ) : (
                  <p className={styles.value}>
                    {formData.email || "Não informado"}
                  </p>
                )}
              </div>
            </Card>

            {isAdvertiser && (
              <Card backgroundColor="var(--dark-complementary-color)">
                <div
                  className={`${styles.cardContent} ${!isEditing.phone ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.phone ? () => handleEdit("phone") : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <div>
                        <h3 className={styles.cardTitle}>Alterar Telefone</h3>
                      </div>
                    </div>
                    {isEditing.phone && (
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleSave("phone")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("phone")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.phone ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, "phone")}
                      className={styles.input}
                      placeholder="Digite seu telefone"
                      autoFocus
                    />
                  ) : (
                    <p className={styles.value}>
                      {formData.phone || "Não informado"}
                    </p>
                  )}
                </div>
              </Card>
            )}

            <Card backgroundColor="var(--dark-complementary-color)">
              <div
                className={`${styles.cardContent} ${!isEditing.address ? styles.clickableCard : ""}`}
                onClick={
                  !isEditing.address ? () => handleEdit("address") : undefined
                }
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <div>
                      <h3 className={styles.cardTitle}>Editar Endereço</h3>
                    </div>
                  </div>
                  {isEditing.address && (
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleSave("address")}
                        disabled={isSaving || !address.cep || !address.number}
                        className={styles.saveButton}
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => handleCancel("address")}
                        disabled={isSaving}
                        className={styles.cancelButton}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                {isEditing.address ? (
                  <div className={styles.addressGrid}>
                    <div className={styles.fullWidth}>
                      <label className={styles.label}>CEP</label>
                      <input
                        type="text"
                        value={address.cep}
                        onChange={(e) =>
                          handleAddressChange("cep", e.target.value)
                        }
                        className={styles.input}
                        placeholder="00000-000"
                        maxLength={9}
                        disabled={isFetchingCep}
                        autoFocus
                      />
                    </div>

                    <div className={styles.halfWidth}>
                      <label className={styles.label}>Estado</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) =>
                          handleAddressChange("state", e.target.value)
                        }
                        className={styles.input}
                        placeholder="UF"
                        readOnly
                      />
                    </div>

                    <div className={styles.halfWidth}>
                      <label className={styles.label}>Cidade</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        className={styles.input}
                        placeholder="Cidade"
                        readOnly
                      />
                    </div>

                    <div className={styles.fullWidth}>
                      <label className={styles.label}>Bairro</label>
                      <input
                        type="text"
                        value={address.neighborhood}
                        onChange={(e) =>
                          handleAddressChange("neighborhood", e.target.value)
                        }
                        className={styles.input}
                        placeholder="Bairro"
                        readOnly
                      />
                    </div>

                    <div className={styles.fullWidth}>
                      <label className={styles.label}>Rua</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        className={styles.input}
                        placeholder="Rua"
                        readOnly
                      />
                    </div>

                    <div className={styles.halfWidth}>
                      <label className={styles.label}>Número *</label>
                      <input
                        type="text"
                        value={address.number}
                        onChange={(e) =>
                          handleAddressChange("number", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "address")}
                        className={styles.input}
                        placeholder="Número"
                        required
                      />
                    </div>

                    <div className={styles.halfWidth}>
                      <label className={styles.label}>Complemento</label>
                      <input
                        type="text"
                        value={address.complement}
                        onChange={(e) =>
                          handleAddressChange("complement", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "address")}
                        className={styles.input}
                        placeholder="Apto, bloco, etc"
                      />
                    </div>
                  </div>
                ) : (
                  <p className={styles.value}>{formatAddress()}</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
