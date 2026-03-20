"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { Monitor, Smartphone, MapPin, Clock, LogOut } from "lucide-react";
import Card from "@/components/ui/Card/Card";
import LoadingContainer from "@/components/ui/LoadingContainer/LoadingContainer";
import styles from "./security.module.css";
import { AlertTriangle } from "lucide-react";

function PasswordRequirements({ password }: { password: string }) {
  const requirements = useMemo(
    () => [
      {
        label: "Deve conter ao menos 8 caracteres.",
        met: password.length >= 8,
      },
      {
        label: "Deve conter ao menos UMA maiúscula.",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Deve conter ao menos UMA minúscula.",
        met: /[a-z]/.test(password),
      },
      { label: "Deve conter ao menos UM número.", met: /\d/.test(password) },
      {
        label: "Deve conter ao menos UM símbolo.",
        met: /[\W_]/.test(password),
      },
    ],
    [password],
  );

  // Requisitos NÃO atendidos
  const unmetRequirements = requirements.filter((req) => !req.met);

  // Se não digitou nada ou se todos foram atendidos, não renderiza nada
  if (!password || unmetRequirements.length === 0) return null;

  return (
    <div className={styles.passwordRequirements}>
      {unmetRequirements.map((req, index) => (
        <div
          key={index}
          className={`${styles.requirement} ${styles.requirementUnmet}`}
        >
          <FaTimes />
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function SecurityPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para notificações
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: false,
  });

  // Estados para exclusão de conta
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Estados para sessões ativas
  const [sessions, setSessions] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState<string | null>(null);

  // Carregar configurações de notificação e sessões
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Primeiro registrar a sessão atual
        if (session?.sessionToken) {
          await fetch("/api/profile/security/sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionToken: session.sessionToken,
            }),
          });
        }

        // Delay mínimo para evitar flickering em conexões rápidas
        const [notificationResponse, sessionsResponse] = await Promise.all([
          fetch("/api/profile/security/notifications"),
          fetch("/api/profile/security/sessions"),
          new Promise((resolve) => setTimeout(resolve, 300)),
        ]);

        if (notificationResponse.ok) {
          const data = await notificationResponse.json();
          setNotifications({
            email: data.emailNotifications,
            whatsapp: data.whatsappNotifications,
          });
        }

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData.sessions || []);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      loadData();
    }
  }, [session]);

  const handlePasswordChange = (
    field: keyof typeof passwordData,
    value: string,
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handler para Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isChangingPassword && !isSaving) {
        handleSavePassword();
      }
    }
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return "A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos.";
    }
    return null;
  };

  const handleSavePassword = async () => {
    // Validações
    if (!passwordData.currentPassword) {
      setPasswordError("Informe sua senha atual");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("Informe a nova senha");
      return;
    }

    const passwordValidation = validatePassword(passwordData.newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("A nova senha deve ser diferente da atual");
      return;
    }

    setIsSaving(true);
    setPasswordError(null);

    try {
      const response = await fetch("/api/profile/security/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao alterar senha");
      }

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Erro ao alterar senha",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const handleNotificationChange = async (
    type: "email" | "whatsapp",
    value: boolean,
  ) => {
    try {
      const response = await fetch("/api/profile/security/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [type === "email" ? "emailNotifications" : "whatsappNotifications"]:
            value,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar configurações");
      }

      setNotifications((prev) => ({ ...prev, [type]: value }));
    } catch (error) {
      console.error("Erro ao atualizar notificações:", error);
      // Reverter o estado em caso de erro
      setNotifications((prev) => ({ ...prev, [type]: !value }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Digite sua senha para confirmar");
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/profile/security/delete", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao excluir conta");
      }

      // Redirecionar para logout ou página inicial
      window.location.href = "/";
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Erro ao excluir conta",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeletePassword("");
    setShowDeletePassword(false);
    setDeleteError(null);
  };

  // Funções para gerenciar sessões
  const handleLogoutSession = async (sessionId: string, isCurrent: boolean) => {
    setIsLoggingOut(sessionId);
    
    try {
      const response = await fetch("/api/profile/security/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        if (isCurrent) {
          // Se for a sessão atual, redirecionar para login
          window.location.href = "/auth/signin";
        } else {
          // Remover da lista
          setSessions(prev => prev.filter(s => s.id !== sessionId));
        }
      }
    } catch (error) {
      console.error("Erro ao fazer logout da sessão:", error);
    } finally {
      setIsLoggingOut(null);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOut("all");
    
    try {
      const response = await fetch("/api/profile/security/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoutAll: true }),
      });

      if (response.ok) {
        // Redirecionar para login após logout de todas as sessões
        window.location.href = "/auth/signin";
      }
    } catch (error) {
      console.error("Erro ao fazer logout de todas as sessões:", error);
    } finally {
      setIsLoggingOut(null);
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingContainer message="Carregando configurações de segurança..." />
      ) : (
        <div className={styles.container}>
          <div className={styles.content}>
            {/* Card de Alterar Senha */}
            <Card backgroundColor="var(--dark-complementary-color)">
              <div
                className={`${styles.cardContent} ${!isChangingPassword ? styles.clickableCard : ""}`}
                onClick={
                  !isChangingPassword
                    ? () => setIsChangingPassword(true)
                    : undefined
                }
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <div>
                      <h3 className={styles.cardTitle}>Alterar Senha</h3>
                      <p className={styles.cardDescription}>
                        Mantenha sua conta segura alterando sua senha
                        regularmente
                      </p>
                    </div>
                  </div>
                  {isChangingPassword && (
                    <div className={styles.actions}>
                      <button
                        onClick={handleSavePassword}
                        disabled={isSaving}
                        className={styles.saveButton}
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={handleCancelPasswordChange}
                        disabled={isSaving}
                        className={styles.cancelButton}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {isChangingPassword && (
                  <div className={styles.passwordForm}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Senha Atual</label>
                      <div className={styles.passwordWrapper}>
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            handlePasswordChange(
                              "currentPassword",
                              e.target.value,
                            )
                          }
                          onKeyPress={handleKeyPress}
                          className={styles.input}
                          placeholder="Digite sua senha atual"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                          className={styles.showPasswordBtn}
                        >
                          {showPasswords.current ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Nova Senha</label>
                      <div className={styles.passwordWrapper}>
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handlePasswordChange("newPassword", e.target.value)
                          }
                          onKeyPress={handleKeyPress}
                          className={styles.input}
                          placeholder="Digite sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className={styles.showPasswordBtn}
                        >
                          {showPasswords.new ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>
                        Confirmar Nova Senha
                      </label>
                      <div className={styles.passwordWrapper}>
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordChange(
                              "confirmPassword",
                              e.target.value,
                            )
                          }
                          onKeyPress={handleKeyPress}
                          className={styles.input}
                          placeholder="Confirme sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className={styles.showPasswordBtn}
                        >
                          {showPasswords.confirm ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </div>

                    <PasswordRequirements password={passwordData.newPassword} />

                    {passwordError && (
                      <p className={styles.error}>{passwordError}</p>
                    )}
                  </div>
                )}

                {passwordSuccess && (
                  <p className={styles.success}>Senha alterada com sucesso!</p>
                )}
              </div>
            </Card>

            {/* Card de Notificações */}
            <Card backgroundColor="var(--dark-complementary-color)">
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <div>
                      <h3 className={styles.cardTitle}>Notificações</h3>
                      <p className={styles.cardDescription}>
                        Configure como você deseja receber nossas notificações
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.notificationOptions}>
                  <div
                    className={styles.notificationOption}
                    onClick={() =>
                      handleNotificationChange("email", !notifications.email)
                    }
                  >
                    <div className={styles.notificationInfo}>
                      <span className={styles.notificationLabel}>
                        Notificações por Email
                      </span>
                      <span className={styles.notificationSubtext}>
                        Receba atualizações importantes por email
                      </span>
                    </div>
                    <div className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => {}} // Controlado pelo onClick do container
                        readOnly
                      />
                      <span className={styles.slider}></span>
                    </div>
                  </div>

                  <div
                    className={styles.notificationOption}
                    onClick={() =>
                      handleNotificationChange(
                        "whatsapp",
                        !notifications.whatsapp,
                      )
                    }
                  >
                    <div className={styles.notificationInfo}>
                      <span className={styles.notificationLabel}>
                        Notificações por WhatsApp
                      </span>
                      <span className={styles.notificationSubtext}>
                        Receba mensagens importantes via WhatsApp
                      </span>
                    </div>
                    <div className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={notifications.whatsapp}
                        onChange={() => {}} // Controlado pelo onClick do container
                        readOnly
                      />
                      <span className={styles.slider}></span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card de Sessões Ativas */}
            <Card backgroundColor="var(--dark-complementary-color)">
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <div>
                      <h3 className={styles.cardTitle}>Sessões Ativas</h3>
                      <p className={styles.cardDescription}>
                        Gerencie os dispositivos conectados à sua conta
                      </p>
                    </div>
                  </div>
                  {sessions.length > 1 && (
                    <div className={styles.actions}>
                      <button
                        onClick={handleLogoutAll}
                        disabled={isLoggingOut === "all"}
                        className={styles.dangerButton}
                      >
                        {isLoggingOut === "all" ? "Desconectando..." : "Desconectar Todos"}
                      </button>
                    </div>
                  )}
                </div>

                {sessions.length > 0 ? (
                  <div className={styles.sessionsList}>
                    {sessions.map((sessionItem) => (
                      <div
                        key={sessionItem.id}
                        className={`${styles.sessionItem} ${sessionItem.isCurrent ? styles.currentSession : ""}`}
                      >
                        {sessionItem.isCurrent && (
                          <div className={styles.currentBadge}>Sessão Atual</div>
                        )}
                        
                        <div className={styles.sessionContent}>
                          <div className={styles.sessionInfo}>
                            <div className={styles.deviceIcon}>
                              {sessionItem.device === "Mobile" ? (
                                <Smartphone size={24} />
                              ) : (
                                <Monitor size={24} />
                              )}
                            </div>
                            
                            <div className={styles.sessionDetails}>
                              <div className={styles.deviceName}>
                                {sessionItem.browser} em {sessionItem.os}
                              </div>
                              
                              <div className={styles.sessionMeta}>
                                <div className={styles.locationInfo}>
                                  <MapPin size={14} />
                                  <span>{sessionItem.city}, {sessionItem.state}</span>
                                </div>
                                
                                <div className={styles.activityInfo}>
                                  <Clock size={14} />
                                  <span>
                                    {new Date(sessionItem.lastActivity).toLocaleString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {!sessionItem.isCurrent && (
                            <button
                              onClick={() => handleLogoutSession(sessionItem.id, sessionItem.isCurrent)}
                              disabled={isLoggingOut === sessionItem.id}
                              className={styles.logoutButton}
                              title="Desconectar sessão"
                            >
                              {isLoggingOut === sessionItem.id ? (
                                <div className={styles.spinner} />
                              ) : (
                                <LogOut size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noSessions}>
                    <p>Nenhuma sessão ativa encontrada</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Card de Excluir Conta */}
            <Card backgroundColor="var(--dark-complementary-color)">
              <div
                className={`${styles.cardContent} ${!showDeleteConfirmation ? styles.clickableCard : ""}`}
                onClick={
                  !showDeleteConfirmation
                    ? () => setShowDeleteConfirmation(true)
                    : undefined
                }
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <div>
                      <h3
                        className={`${styles.cardTitle} ${styles.dangerTitle}`}
                      >
                        Excluir Conta
                      </h3>
                      <p className={styles.cardDescription}>
                        Esta ação desativará permanentemente sua conta
                      </p>
                    </div>
                  </div>
                  {showDeleteConfirmation && (
                    <div className={styles.actions}>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={!deletePassword || isDeletingAccount}
                        className={styles.dangerButton}
                      >
                        {isDeletingAccount
                          ? "Excluindo..."
                          : "Confirmar Exclusão"}
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        disabled={isDeletingAccount}
                        className={styles.cancelButton}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {showDeleteConfirmation && (
                  <div className={styles.deleteConfirmation}>
                    <div className={styles.warningBox}>
                      <h4>
                        <AlertTriangle size={20} /> Atenção!
                      </h4>
                      <p>
                        Esta ação desativará sua conta e você não poderá mais
                        acessá-la.
                      </p>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Senha Atual</label>
                      <div className={styles.passwordWrapper}>
                        <input
                          type={showDeletePassword ? "text" : "password"}
                          value={deletePassword}
                          onChange={(e) => {
                            setDeletePassword(e.target.value);
                            setDeleteError(null);
                          }}
                          className={styles.input}
                          placeholder="Digite sua senha para confirmar"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowDeletePassword(!showDeletePassword)
                          }
                          className={styles.showPasswordBtn}
                        >
                          {showDeletePassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </div>

                    {deleteError && (
                      <p className={styles.error}>{deleteError}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
