"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./advertiser.module.css";
import commonStyles from "../../admin-common.module.css";
import {
  ArrowLeft,
  User,
  Settings,
  MessageCircle,
  Phone,
  CreditCard,
  ExternalLink,
  RotateCw,
  AlertTriangle,
  IdCard,
  Images,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card/Card";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import Slider from "@/components/Slider/Slider";

interface AdvertiserDetails {
  id: number;
  userId: number;
  name: string;
  producerName: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "TRANS";
  document: string;
  nationality: string;
  birthday: string;
  signature: "COPPER" | "SILVER" | "GOLD" | "DIAMOND";
  verificationStatus: "RED" | "YELLOW" | "GREEN";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  notifications: {
    email: boolean;
    whatsapp: boolean;
  };
  profile: {
    id: number;
    name: string | null;
    age: number | null;
    slogan: string;
    description: string;
    images: any;
    views: {
      total: number;
      last7Days: number;
      last30Days: number;
    };
    contacts: Array<{
      id: number;
      type: string;
      label: string;
      value: string;
      isPrimary: boolean;
      isPublic: boolean;
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      reviewerName: string | null;
      isApproved: boolean;
      createdAt: string;
    }>;
    prices: Array<{
      id: number;
      type: string;
      label: string;
      value: number;
    }>;
    payments: Array<{
      id: number;
      type: string;
      label: string;
    }>;
  } | null;
  subscriptions: Array<{
    id: string;
    planName: string;
    signature: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    createdAt: string;
    payments: Array<{
      id: string;
      amount: number;
      method: string;
      status: string;
      dueDate: string | null;
      paidAt: string | null;
      createdAt: string;
    }>;
  }>;
  currentSubscription: {
    id: string;
    planName: string;
    signature: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  } | null;
  activeSessions: Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    country: string | null;
    state: string | null;
    city: string | null;
    device: string | null;
    browser: string | null;
    os: string | null;
    lastActivity: string;
    createdAt: string;
  }>;
}

const SIGNATURE_LABELS = {
  COPPER: "Cobre",
  SILVER: "Prata",
  GOLD: "Ouro",
  DIAMOND: "Diamante",
} as const;

const STATUS_LABELS = {
  RED: "Reprovado",
  YELLOW: "Em Análise",
  GREEN: "Aprovado",
} as const;

const GENDER_LABELS = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  TRANS: "Trans",
} as const;

const GENDER_OPTIONS = Object.values(GENDER_LABELS);
const SIGNATURE_OPTIONS = Object.values(SIGNATURE_LABELS);
const STATUS_OPTIONS = Object.values(STATUS_LABELS);

// Helper functions to convert between labels and keys
const getGenderKeyFromLabel = (label: string) => {
  return (
    Object.entries(GENDER_LABELS).find(([_, l]) => l === label)?.[0] || "MALE"
  );
};

const getSignatureKeyFromLabel = (label: string) => {
  return (
    Object.entries(SIGNATURE_LABELS).find(([_, l]) => l === label)?.[0] ||
    "COPPER"
  );
};

const getStatusKeyFromLabel = (label: string) => {
  return (
    Object.entries(STATUS_LABELS).find(([_, l]) => l === label)?.[0] || "RED"
  );
};

const PAYMENT_METHOD_LABELS = {
  CREDIT_CARD: "Cartão de Crédito",
  PIX: "PIX",
  BOLETO: "Boleto",
  PAYPAL: "PayPal",
} as const;

const PAYMENT_STATUS_LABELS = {
  PENDING: "Pendente",
  COMPLETED: "Pago",
  FAILED: "Falhou",
  REFUNDED: "Reembolsado",
  CANCELLED: "Cancelado",
} as const;

export default function AdvertiserDetailsPage() {
  const params = useParams();
  const [advertiser, setAdvertiser] = useState<AdvertiserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false);
  const [hasPendencies, setHasPendencies] = useState(false);
  const [showImageSlider, setShowImageSlider] = useState(false);

  // Estados para edição inline
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
    document: false,
    nationality: false,
    birthday: false,
    gender: false,
    profileName: false,
    profileAge: false,
    profileSlogan: false,
    profileDescription: false,
    producerName: false,
    producerPhone: false,
    emailNotifications: false,
    whatsappNotifications: false,
  });

  const [editingData, setEditingData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    nationality: "",
    birthday: "",
    gender: "MALE" as "MALE" | "FEMALE" | "TRANS",
    profileName: "",
    profileAge: "",
    profileSlogan: "",
    profileDescription: "",
    producerName: "",
    producerPhone: "",
    emailNotifications: "true",
    whatsappNotifications: "false",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Estados para edição de contatos do perfil
  const [editingContacts, setEditingContacts] = useState<{
    [key: number]: boolean;
  }>({});
  const [contactEditData, setContactEditData] = useState<{
    [key: number]: string;
  }>({});

  // Estados para dropdowns
  const [countries, setCountries] = useState<string[]>([]);

  const advertiserId = params.id as string;

  useEffect(() => {
    fetchAdvertiserDetails();
  }, [advertiserId]);

  useEffect(() => {
    if (advertiser) {
      checkProfilePendencies();
      // Inicializar dados de edição
      setEditingData({
        name: advertiser.name || "",
        email: advertiser.email || "",
        phone: advertiser.phone || "",
        document: advertiser.document || "",
        nationality: advertiser.nationality || "",
        birthday: formatDateForInput(advertiser.birthday),
        gender: advertiser.gender || "MALE",
        profileName: advertiser.profile?.name || "",
        profileAge: advertiser.profile?.age?.toString() || "",
        profileSlogan: advertiser.profile?.slogan || "",
        profileDescription: advertiser.profile?.description || "",
        producerName: advertiser.producerName || "",
        producerPhone: advertiser.phone || "",
        emailNotifications: advertiser.notifications?.email ? "true" : "false",
        whatsappNotifications: advertiser.notifications?.whatsapp ? "true" : "false",
      });
    }
  }, [advertiser]);

  // Carregar países para o dropdown de nacionalidade
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/paises/",
        );
        const data = await res.json();

        const list = data
          .map((item: any) => item.nome?.abreviado)
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b));

        setCountries(list);
      } catch (err) {
        console.error("Erro ao carregar países", err);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showImageSlider) {
        setShowImageSlider(false);
      }
    };

    if (showImageSlider) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showImageSlider]);

  const fetchAdvertiserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/advertisers/${advertiserId}`);

      if (!response.ok) {
        throw new Error("Falha ao carregar detalhes do anunciante");
      }

      const data = await response.json();
      setAdvertiser(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const updateAdvertiser = async (data: {
    signature?: string;
    verificationStatus?: string;
    isVerified?: boolean;
  }) => {
    try {
      setUpdating(true);

      const response = await fetch(`/api/admin/advertisers/${advertiserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar anunciante");
      }

      // Recarregar dados
      await fetchAdvertiserDetails();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert(
        `Erro ao atualizar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    }
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }
    return phone;
  };

  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate) return "";
    try {
      // Extrair apenas a parte da data (YYYY-MM-DD) ignorando o horário e timezone
      const datePart = isoDate.split("T")[0];
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return "";
    try {
      // Extrair apenas a parte da data (YYYY-MM-DD) ignorando o horário e timezone
      const datePart = isoDate.split("T")[0];
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  const formatDateInput = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 10);

  const formatCPFInput = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);

  const formatPhoneInput = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .slice(0, 15);

  const validateBirthday = (birthRaw: string) => {
    if (!birthRaw)
      return { valid: false, reason: "Informe a data de nascimento" };

    const [d, m, y] = birthRaw.split("/").map(Number);
    if (!d || !m || !y) return { valid: false, reason: "Data incompleta" };

    const date = new Date(y, m - 1, d);
    if (
      date.getDate() !== d ||
      date.getMonth() + 1 !== m ||
      date.getFullYear() !== y
    )
      return { valid: false, reason: "Data inválida" };

    const today = new Date();
    const age =
      today.getFullYear() -
      y -
      (today.getMonth() + 1 < m ||
      (today.getMonth() + 1 === m && today.getDate() < d)
        ? 1
        : 0);

    if (age < 18)
      return { valid: false, reason: "Deve ter pelo menos 18 anos" };
    if (age > 120) return { valid: false, reason: "Idade inválida" };
    return { valid: true, reason: "" };
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return 0;
    try {
      // Extrair apenas a parte da data (YYYY-MM-DD) ignorando o horário e timezone
      const datePart = birthday.split("T")[0];
      const [year, month, day] = datePart.split("-").map(Number);

      const today = new Date();
      const birthDate = new Date(year, month - 1, day);

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    } catch {
      return 0;
    }
  };

  const checkProfilePendencies = async () => {
    try {
      const response = await fetch(
        `/api/admin/advertisers/profile-check?producerId=${advertiser?.id}`,
      );

      if (!response.ok) {
        setHasPendencies(false);
        return false;
      }

      const data = await response.json();
      const pendenciesExist = data.missing && data.missing.length > 0;
      setHasPendencies(pendenciesExist);
      return pendenciesExist;
    } catch (error) {
      console.error("Erro ao verificar pendências:", error);
      setHasPendencies(false);
      return false;
    }
  };

  const openContactChannel = (contact: {
    type: string;
    value: string;
    label: string;
  }) => {
    const cleanValue = contact.value.replace(/\D/g, "");

    switch (contact.type.toLowerCase()) {
      case "whatsapp":
        window.open(`https://wa.me/${cleanValue}`, "_blank");
        break;
      case "telegram":
        // Remove @ se existir e abre o Telegram
        const telegramUser = contact.value.replace("@", "");
        window.open(`https://t.me/${telegramUser}`, "_blank");
        break;
      case "instagram":
        // Remove @ se existir e abre o Instagram
        const instagramUser = contact.value.replace("@", "");
        window.open(`https://instagram.com/${instagramUser}`, "_blank");
        break;
      default:
        // Para outros tipos, tenta abrir como URL se começar com http
        if (contact.value.startsWith("http")) {
          window.open(contact.value, "_blank");
        } else {
          alert(
            `Tipo de contato "${contact.type}" não suportado para abertura automática.`,
          );
        }
    }
  };

  const sendWhatsAppMessage = async (
    phone: string,
    hasAlert: boolean = false,
  ) => {
    try {
      if (hasAlert) {
        // Verificar pendências do perfil
        const response = await fetch(
          `/api/admin/advertisers/profile-check?producerId=${advertiser?.id}`,
        );

        if (!response.ok) throw new Error("Falha ao verificar perfil");

        const data = await response.json();

        if (data.missing.length === 0) {
          alert("Perfil está completo! Não há pendências.");
          return;
        }

        // Gerar mensagem de alerta
        const firstName = advertiser?.name.split(" ")[0];
        let message = `Olá, ${firstName}!\n\n`;
        message += `Percebemos que você está com algumas pendências no seu perfil. Gostaríamos de ajudá-la(o) a completar o cadastro!\n\n`;
        message += `Segue um breve passo a passo dos campos que ainda precisam ser preenchidos:\n\n`;

        const fieldTips: Record<string, string> = {
          "Nome do perfil":
            "Preencha o nome artístico/profissional que aparecerá no seu perfil público.",
          "Idade do perfil":
            "Informe sua idade (entre 18 e 99 anos) no campo específico do perfil.",
          "Ao menos 1 imagem":
            "Adicione pelo menos uma foto ao seu perfil na seção de Imagens.",
          "Ao menos 1 preço e forma de pagamento":
            "Cadastre seus valores e selecione as formas de pagamento aceitas.",
          "Idiomas falados":
            "Selecione os idiomas que você fala na seção de Idiomas.",
          "Público que atende":
            "Indique qual público você atende na seção de Público.",
          "Ao menos 1 contato":
            "Preencha pelo menos um meio de contato (WhatsApp, Telegram ou Instagram).",
        };

        data.missing.forEach((item: string, index: number) => {
          const tip = fieldTips[item] || "Preencha este campo no seu perfil.";
          message += `*${index + 1}. ${item}*\n${tip}\n\n`;
        });

        message += `Caso ainda tenha dúvidas, ficamos à disposição para ajudar!\n\n`;
        message += `A Luxence agradece sua confiança e preferência.`;

        const cleanPhone = phone.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURI(message)}`;
        window.open(whatsappUrl, "_blank");
      } else {
        // Abrir WhatsApp sem mensagem
        const cleanPhone = phone.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/${cleanPhone}`;
        window.open(whatsappUrl, "_blank");
      }
    } catch (error) {
      console.error("Erro ao abrir WhatsApp:", error);
      alert("Erro ao abrir WhatsApp");
    }
  };

  // Funções de edição inline
  const handleEdit = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    // Restaurar dados originais
    if (advertiser) {
      setEditingData((prev) => ({
        ...prev,
        name: advertiser.name || "",
        email: advertiser.email || "",
        phone: advertiser.phone || "",
        document: advertiser.document || "",
        nationality: advertiser.nationality || "",
        birthday: formatDateForInput(advertiser.birthday),
        gender: advertiser.gender || "MALE",
        profileName: advertiser.profile?.name || "",
        profileAge: advertiser.profile?.age?.toString() || "",
        profileSlogan: advertiser.profile?.slogan || "",
        profileDescription: advertiser.profile?.description || "",
        producerName: advertiser.producerName || "",
        producerPhone: advertiser.phone || "",
        emailNotifications: advertiser.notifications?.email ? "true" : "false",
        whatsappNotifications: advertiser.notifications?.whatsapp ? "true" : "false",
      }));
    }
  };

  const handleChange = (field: keyof typeof editingData, value: string) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field: keyof typeof isEditing) => {
    setIsSaving(true);
    try {
      let updateData: any = {};

      // Validação específica para birthday
      if (field === "birthday") {
        const validation = validateBirthday(editingData.birthday);
        if (!validation.valid) {
          alert(validation.reason);
          return;
        }
        // Converter formato dd/mm/yyyy para ISO date (UTC)
        const [d, m, y] = editingData.birthday.split("/").map(Number);
        // Criar data em UTC para evitar problemas de fuso horário
        const isoDate = new Date(Date.UTC(y, m - 1, d)).toISOString();
        updateData.birthday = isoDate;
      } else if (field === "profileName" || field === "profileAge" || field === "profileSlogan" || field === "profileDescription") {
        // Campos do perfil
        updateData.profile = {};
        if (field === "profileName") {
          updateData.profile.name = editingData.profileName;
        } else if (field === "profileAge") {
          const age = parseInt(editingData.profileAge);
          if (isNaN(age) || age < 18 || age > 99) {
            alert("Idade deve ser um número entre 18 e 99 anos");
            return;
          }
          updateData.profile.age = age;
        } else if (field === "profileSlogan") {
          updateData.profile.slogan = editingData.profileSlogan;
        } else if (field === "profileDescription") {
          updateData.profile.description = editingData.profileDescription;
        }
      } else if (field === "producerName" || field === "producerPhone") {
        // Campos específicos do producer
        if (field === "producerName") {
          updateData.name = editingData.producerName;
        } else if (field === "producerPhone") {
          const cleanPhone = editingData.producerPhone.replace(/\D/g, "");
          updateData.phone = cleanPhone;
        }
      } else if (field === "emailNotifications" || field === "whatsappNotifications") {
        // Campos de notificação
        updateData.notifications = {};
        if (field === "emailNotifications") {
          updateData.notifications.email = editingData.emailNotifications === "true";
        } else if (field === "whatsappNotifications") {
          updateData.notifications.whatsapp = editingData.whatsappNotifications === "true";
        }
      } else {
        // Campos do usuário/producer
        if (field === "name" || field === "email") {
          updateData.user = { [field]: editingData[field] };
        } else if (field === "phone") {
          // Remover formatação do telefone antes de salvar
          const cleanPhone = editingData.phone.replace(/\D/g, "");
          updateData.user = { phone: cleanPhone };
        } else if (field === "gender") {
          updateData.user = { gender: editingData.gender };
        } else {
          // Campos do producer (document, nationality)
          if (field === "document") {
            // Remover formatação do CPF antes de salvar
            const cleanDocument = editingData.document.replace(/\D/g, "");
            updateData.document = cleanDocument;
          } else {
            updateData[field] = editingData[field];
          }
        }
      }

      const response = await fetch(`/api/admin/advertisers/${advertiserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar dados");
      }

      // Recarregar dados
      await fetchAdvertiserDetails();
      setIsEditing((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    field: keyof typeof isEditing,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(field);
    }
  };

  // Funções para edição de contatos do perfil
  const handleEditContact = (contactId: number, currentValue: string) => {
    setEditingContacts((prev) => ({ ...prev, [contactId]: true }));
    setContactEditData((prev) => ({ ...prev, [contactId]: currentValue }));
  };

  const handleCancelContact = (contactId: number) => {
    setEditingContacts((prev) => ({ ...prev, [contactId]: false }));
    setContactEditData((prev) => {
      const newData = { ...prev };
      delete newData[contactId];
      return newData;
    });
  };

  const handleChangeContact = (
    contactId: number,
    value: string,
    contactType: string,
  ) => {
    let formattedValue = value;

    // Aplicar formatação baseada no tipo de contato
    if (
      contactType.toLowerCase() === "whatsapp" ||
      contactType.toLowerCase() === "telefone"
    ) {
      formattedValue = formatPhoneInput(value);
    }

    setContactEditData((prev) => ({ ...prev, [contactId]: formattedValue }));
  };

  const handleSaveContact = async (contactId: number) => {
    setIsSaving(true);
    try {
      let newValue = contactEditData[contactId];

      // Encontrar o tipo de contato para determinar se precisa limpar formatação
      const contact = advertiser?.profile?.contacts.find(
        (c) => c.id === contactId,
      );
      if (
        contact &&
        (contact.type.toLowerCase() === "whatsapp" ||
          contact.type.toLowerCase() === "telefone")
      ) {
        // Remover formatação do telefone antes de salvar
        newValue = newValue.replace(/\D/g, "");
      }

      const response = await fetch(`/api/admin/advertisers/${advertiserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contactId.toString(),
          contactValue: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar contato");
      }

      // Recarregar dados
      await fetchAdvertiserDetails();
      setEditingContacts((prev) => ({ ...prev, [contactId]: false }));
      setContactEditData((prev) => {
        const newData = { ...prev };
        delete newData[contactId];
        return newData;
      });
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
      alert("Erro ao salvar contato. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPressContact = (e: React.KeyboardEvent, contactId: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveContact(contactId);
    }
  };

  if (loading) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.loading}>
          <div className={commonStyles.spinner}></div>
          <span>Carregando detalhes do anunciante...</span>
        </div>
      </div>
    );
  }

  if (error || !advertiser) {
    return (
      <div className={commonStyles.container}>
        <div className={commonStyles.error}>
          <AlertTriangle size={48} />
          <h2>Erro ao carregar anunciante</h2>
          <p>{error || "Anunciante não encontrado"}</p>
          <button
            onClick={fetchAdvertiserDetails}
            className={commonStyles.retryButton}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={commonStyles.container}>
      <header className={commonStyles.header}>
        <div className={commonStyles.headerContent}>
          <h1 className={commonStyles.title}>
            {advertiser.name}
            {advertiser.producerName && (
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--light-complementary-color)",
                  fontSize: "var(--ft-md)",
                }}
              >
                {" "}
                ({advertiser.producerName})
              </span>
            )}
          </h1>
          <p className={commonStyles.subtitle}>
            Cadastrado em {formatDate(advertiser.createdAt)} • ID:{" "}
            {advertiser.id}
          </p>
        </div>
        <div className={commonStyles.controls}>
          <Link href="/admin/advertisers" className={styles.backButton}>
            <ArrowLeft size={16} />
            <span className={styles.backText}>Voltar</span>
          </Link>
          <button
            onClick={fetchAdvertiserDetails}
            className={commonStyles.refreshButton}
            disabled={loading}
          >
            <RotateCw
              size={16}
              className={loading ? commonStyles.spinning : ""}
            />
            <span className={commonStyles.refreshText}>
              {loading ? "Atualizando..." : "Atualizar"}
            </span>
          </button>
        </div>
      </header>

      <div className={commonStyles.content}>
        {/* Seções Principais */}
        <div className={commonStyles.cardsGrid}>
          {/* Informações Pessoais - Section */}
          <section className={commonStyles.section}>
            <div className={commonStyles.sectionHeader}>
              <div className={commonStyles.sectionTitle}>
                <IdCard className={commonStyles.sectionIcon} />
                <h3>Informações Pessoais</h3>
              </div>
            </div>

            <div className={styles.cardsContainer}>
              {/* Nome Real */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.name ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.name ? () => handleEdit("name") : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Nome Real</h4>
                    </div>
                    {isEditing.name && (
                      <div className={styles.cardActions}>
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
                      value={editingData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, "name")}
                      className={styles.cardInput}
                      placeholder="Digite o nome"
                      autoFocus
                    />
                  ) : (
                    <p className={styles.cardValue}>
                      {advertiser.name || "Não informado"}
                    </p>
                  )}
                </div>
              </Card>

              {/* CPF */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.document ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.document
                      ? () => handleEdit("document")
                      : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>CPF</h4>
                    </div>
                    {isEditing.document && (
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleSave("document")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("document")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.document ? (
                    <input
                      type="text"
                      value={editingData.document}
                      onChange={(e) =>
                        handleChange("document", formatCPFInput(e.target.value))
                      }
                      onKeyPress={(e) => handleKeyPress(e, "document")}
                      className={styles.cardInput}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      autoFocus
                    />
                  ) : (
                    <p className={styles.cardValue}>
                      {formatCPF(advertiser.document)}
                    </p>
                  )}
                </div>
              </Card>

              {/* Data de Nascimento */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.birthday ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.birthday
                      ? () => handleEdit("birthday")
                      : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Data de Nascimento</h4>
                    </div>
                    {isEditing.birthday && (
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleSave("birthday")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("birthday")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.birthday ? (
                    <input
                      type="text"
                      value={editingData.birthday}
                      onChange={(e) =>
                        handleChange(
                          "birthday",
                          formatDateInput(e.target.value),
                        )
                      }
                      onKeyPress={(e) => handleKeyPress(e, "birthday")}
                      className={styles.cardInput}
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      autoFocus
                    />
                  ) : (
                    <p className={styles.cardValue}>
                      {advertiser.birthday
                        ? formatDateForDisplay(advertiser.birthday)
                        : "Não informado"}
                    </p>
                  )}
                </div>
              </Card>

              {/* Gênero */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.gender ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.gender ? () => handleEdit("gender") : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Gênero</h4>
                    </div>
                    {isEditing.gender && (
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleSave("gender")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("gender")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.gender ? (
                    <Dropdown
                      trigger={
                        GENDER_LABELS[
                          editingData.gender as keyof typeof GENDER_LABELS
                        ]
                      }
                      selectedValue={
                        GENDER_LABELS[
                          editingData.gender as keyof typeof GENDER_LABELS
                        ]
                      }
                      triggerClassName={styles.cardDropdownTrigger}
                      menuClassName={styles.cardDropdownMenu}
                      options={GENDER_OPTIONS}
                      onSelect={(label) =>
                        handleChange("gender", getGenderKeyFromLabel(label))
                      }
                    >
                      <></>
                    </Dropdown>
                  ) : (
                    <p className={styles.cardValue}>
                      {GENDER_LABELS[advertiser.gender]}
                    </p>
                  )}
                </div>
              </Card>

              {/* Nacionalidade */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.nationality ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.nationality
                      ? () => handleEdit("nationality")
                      : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Nacionalidade</h4>
                    </div>
                    {isEditing.nationality && (
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleSave("nationality")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("nationality")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.nationality ? (
                    <Dropdown
                      trigger={
                        editingData.nationality || "Selecione a nacionalidade"
                      }
                      selectedValue={editingData.nationality}
                      triggerClassName={styles.cardDropdownTrigger}
                      menuClassName={styles.cardDropdownMenu}
                      searchable={true}
                      searchPlaceholder="Buscar país..."
                      options={countries}
                      onSelect={(value) => handleChange("nationality", value)}
                    >
                      <></>
                    </Dropdown>
                  ) : (
                    <p className={styles.cardValue}>{advertiser.nationality}</p>
                  )}
                </div>
              </Card>

              {/* Email */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.email ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.email ? () => handleEdit("email") : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Email</h4>
                    </div>
                    {isEditing.email && (
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleSave("email")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("email")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.email ? (
                    <input
                      type="email"
                      value={editingData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, "email")}
                      className={styles.cardInput}
                      placeholder="Digite o email"
                      autoFocus
                    />
                  ) : (
                    <div className={styles.cardValueWithAction}>
                      <p className={styles.cardValue}>
                        {advertiser.email || "Não informado"}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${advertiser.email}`, "_blank");
                        }}
                        className={`${styles.cardActionButton} ${styles.emailButton}`}
                        title="Abrir cliente de email"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Contato Principal - Editável */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.phone ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.phone ? () => handleEdit("phone") : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Contato</h4>
                    </div>
                    {isEditing.phone && (
                      <div className={styles.cardActions}>
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
                      value={editingData.phone}
                      onChange={(e) =>
                        handleChange("phone", formatPhoneInput(e.target.value))
                      }
                      onKeyPress={(e) => handleKeyPress(e, "phone")}
                      className={styles.cardInput}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      autoFocus
                    />
                  ) : (
                    <div className={styles.cardValueWithAction}>
                      <p className={styles.cardValue}>
                        {formatPhone(advertiser.phone)}
                      </p>
                      <div className={styles.cardActionButtons}>
                        {hasPendencies && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sendWhatsAppMessage(advertiser.phone, true);
                            }}
                            className={`${styles.cardActionButton} ${styles.alertButton}`}
                            title="Enviar mensagem de alerta sobre pendências"
                          >
                            <AlertTriangle size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendWhatsAppMessage(advertiser.phone, false);
                          }}
                          className={`${styles.cardActionButton} ${styles.whatsappButton}`}
                          title="Abrir WhatsApp"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Notificações por Email */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.emailNotifications ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.emailNotifications
                      ? () => handleEdit("emailNotifications")
                      : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Notificações por Email</h4>
                    </div>
                    {isEditing.emailNotifications && (
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleSave("emailNotifications")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("emailNotifications")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.emailNotifications ? (
                    <Dropdown
                      trigger={editingData.emailNotifications ? "Ativado" : "Desativado"}
                      selectedValue={editingData.emailNotifications ? "Ativado" : "Desativado"}
                      triggerClassName={styles.cardDropdownTrigger}
                      menuClassName={styles.cardDropdownMenu}
                      options={["Ativado", "Desativado"]}
                      onSelect={(value) =>
                        handleChange("emailNotifications", value === "Ativado" ? "true" : "false")
                      }
                    >
                      <></>
                    </Dropdown>
                  ) : (
                    <p className={styles.cardValue}>
                      {advertiser.notifications?.email ? "Ativado" : "Desativado"}
                    </p>
                  )}
                </div>
              </Card>

              {/* Notificações por WhatsApp */}
              <Card
                backgroundColor="var(--dark-complementary-color)"
                size="medium"
              >
                <div
                  className={`${styles.cardContent} ${!isEditing.whatsappNotifications ? styles.clickableCard : ""}`}
                  onClick={
                    !isEditing.whatsappNotifications
                      ? () => handleEdit("whatsappNotifications")
                      : undefined
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleSection}>
                      <h4 className={styles.cardTitle}>Notificações por WhatsApp</h4>
                    </div>
                    {isEditing.whatsappNotifications && (
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleSave("whatsappNotifications")}
                          disabled={isSaving}
                          className={styles.saveButton}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => handleCancel("whatsappNotifications")}
                          disabled={isSaving}
                          className={styles.cancelButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing.whatsappNotifications ? (
                    <Dropdown
                      trigger={editingData.whatsappNotifications ? "Ativado" : "Desativado"}
                      selectedValue={editingData.whatsappNotifications ? "Ativado" : "Desativado"}
                      triggerClassName={styles.cardDropdownTrigger}
                      menuClassName={styles.cardDropdownMenu}
                      options={["Ativado", "Desativado"]}
                      onSelect={(value) =>
                        handleChange("whatsappNotifications", value === "Ativado" ? "true" : "false")
                      }
                    >
                      <></>
                    </Dropdown>
                  ) : (
                    <p className={styles.cardValue}>
                      {advertiser.notifications?.whatsapp ? "Ativado" : "Desativado"}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </section>

          {/* Informações do Perfil - Cards Individuais */}
          <section className={commonStyles.section}>
            <div className={commonStyles.sectionHeader}>
              <div className={commonStyles.sectionTitle}>
                <User className={commonStyles.sectionIcon} />
                <h3>Informações do Perfil</h3>
              </div>
              {/* Ações do Perfil */}
              <div className={styles.profileActions}>
                <button
                  onClick={() =>
                    window.open(`/product/${advertiser.id}`, "_blank")
                  }
                  className={styles.viewProfileButton}
                >
                  <span>Ver Perfil</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            {advertiser.profile ? (
              <div className={styles.cardsContainer}>
                {/* Views e Média - Cards independentes lado a lado */}
                <div className={styles.statsRow}>
                  <Card
                    backgroundColor="var(--dark-complementary-color)"
                    size="medium"
                  >
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardTitleSection}>
                          <h4 className={styles.cardTitle}>Visualizações</h4>
                        </div>
                      </div>
                      <p className={styles.cardValue}>
                        {advertiser.profile.views.total} visualizações
                      </p>
                    </div>
                  </Card>

                  <Card
                    backgroundColor="var(--dark-complementary-color)"
                    size="medium"
                  >
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardTitleSection}>
                          <h4 className={styles.cardTitle}>Avaliações</h4>
                        </div>
                      </div>
                      <p className={styles.cardValue}>
                        {advertiser.profile.reviews.length > 0
                          ? (
                              advertiser.profile.reviews.reduce(
                                (sum, review) => sum + review.rating,
                                0,
                              ) / advertiser.profile.reviews.length
                            ).toFixed(1)
                          : "0.0"}{" "}
                        ({advertiser.profile.reviews.length} avaliações)
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Nome do Perfil */}
                <Card
                  backgroundColor="var(--dark-complementary-color)"
                  size="medium"
                >
                  <div
                    className={`${styles.cardContent} ${!isEditing.profileName ? styles.clickableCard : ""}`}
                    onClick={
                      !isEditing.profileName
                        ? () => handleEdit("profileName")
                        : undefined
                    }
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleSection}>
                        <h4 className={styles.cardTitle}>Nome do Perfil</h4>
                      </div>
                      {isEditing.profileName && (
                        <div className={styles.cardActions}>
                          <button
                            onClick={() => handleSave("profileName")}
                            disabled={isSaving}
                            className={styles.saveButton}
                          >
                            {isSaving ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            onClick={() => handleCancel("profileName")}
                            disabled={isSaving}
                            className={styles.cancelButton}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing.profileName ? (
                      <input
                        type="text"
                        value={editingData.profileName}
                        onChange={(e) =>
                          handleChange("profileName", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "profileName")}
                        className={styles.cardInput}
                        placeholder="Digite o nome do perfil"
                        autoFocus
                      />
                    ) : (
                      <p className={styles.cardValue}>
                        {advertiser.profile.name || "Não informado"}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Idade do Perfil */}
                <Card
                  backgroundColor="var(--dark-complementary-color)"
                  size="medium"
                >
                  <div
                    className={`${styles.cardContent} ${!isEditing.profileAge ? styles.clickableCard : ""}`}
                    onClick={
                      !isEditing.profileAge
                        ? () => handleEdit("profileAge")
                        : undefined
                    }
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleSection}>
                        <h4 className={styles.cardTitle}>Idade do Perfil</h4>
                      </div>
                      {isEditing.profileAge && (
                        <div className={styles.cardActions}>
                          <button
                            onClick={() => handleSave("profileAge")}
                            disabled={isSaving}
                            className={styles.saveButton}
                          >
                            {isSaving ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            onClick={() => handleCancel("profileAge")}
                            disabled={isSaving}
                            className={styles.cancelButton}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing.profileAge ? (
                      <input
                        type="number"
                        min="18"
                        max="99"
                        value={editingData.profileAge}
                        onChange={(e) =>
                          handleChange("profileAge", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "profileAge")}
                        className={styles.cardInput}
                        placeholder="Digite a idade (18-99)"
                        autoFocus
                      />
                    ) : (
                      <p className={styles.cardValue}>
                        {advertiser.profile.age
                          ? `${advertiser.profile.age} anos`
                          : "Não informado"}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Slogan do Perfil */}
                <Card
                  backgroundColor="var(--dark-complementary-color)"
                  size="medium"
                >
                  <div
                    className={`${styles.cardContent} ${!isEditing.profileSlogan ? styles.clickableCard : ""}`}
                    onClick={
                      !isEditing.profileSlogan
                        ? () => handleEdit("profileSlogan")
                        : undefined
                    }
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleSection}>
                        <h4 className={styles.cardTitle}>Slogan</h4>
                      </div>
                      {isEditing.profileSlogan && (
                        <div className={styles.cardActions}>
                          <button
                            onClick={() => handleSave("profileSlogan")}
                            disabled={isSaving}
                            className={styles.saveButton}
                          >
                            {isSaving ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            onClick={() => handleCancel("profileSlogan")}
                            disabled={isSaving}
                            className={styles.cancelButton}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing.profileSlogan ? (
                      <input
                        type="text"
                        value={editingData.profileSlogan}
                        onChange={(e) =>
                          handleChange("profileSlogan", e.target.value)
                        }
                        onKeyPress={(e) => handleKeyPress(e, "profileSlogan")}
                        className={styles.cardInput}
                        placeholder="Digite o slogan"
                        autoFocus
                      />
                    ) : (
                      <p className={styles.cardValue}>
                        {advertiser.profile.slogan || "Não informado"}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Descrição do Perfil */}
                <Card
                  backgroundColor="var(--dark-complementary-color)"
                  size="medium"
                >
                  <div
                    className={`${styles.cardContent} ${!isEditing.profileDescription ? styles.clickableCard : ""}`}
                    onClick={
                      !isEditing.profileDescription
                        ? () => handleEdit("profileDescription")
                        : undefined
                    }
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleSection}>
                        <h4 className={styles.cardTitle}>Descrição</h4>
                      </div>
                      {isEditing.profileDescription && (
                        <div className={styles.cardActions}>
                          <button
                            onClick={() => handleSave("profileDescription")}
                            disabled={isSaving}
                            className={styles.saveButton}
                          >
                            {isSaving ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            onClick={() => handleCancel("profileDescription")}
                            disabled={isSaving}
                            className={styles.cancelButton}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing.profileDescription ? (
                      <textarea
                        value={editingData.profileDescription}
                        onChange={(e) =>
                          handleChange("profileDescription", e.target.value)
                        }
                        className={`${styles.cardInput} ${styles.cardTextarea}`}
                        placeholder="Digite a descrição"
                        rows={4}
                        autoFocus
                      />
                    ) : (
                      <p className={styles.cardValue}>
                        {advertiser.profile.description || "Não informado"}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Imagens - Card seguindo padrão */}
                <Card
                  backgroundColor="var(--dark-complementary-color)"
                  size="medium"
                >
                  <div
                    className={`${styles.cardContent} ${styles.clickableCard}`}
                    onClick={() => setShowImageSlider(true)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleSection}>
                        <h4 className={styles.cardTitle}>Imagens</h4>
                      </div>
                      <div className={styles.cardActionLink}>
                        <span>Gerenciar</span>
                        <ExternalLink size={14} />
                      </div>
                    </div>
                    <p className={styles.cardValue}>
                      {advertiser.profile.images
                        ? Array.isArray(advertiser.profile.images)
                          ? `${advertiser.profile.images.length} imagens`
                          : `${Object.keys(advertiser.profile.images).length} imagens`
                        : "0 imagens"}
                    </p>
                  </div>
                </Card>

                {/* Contatos do Perfil - Cards independentes e editáveis */}
                {advertiser.profile.contacts.length > 0 &&
                  advertiser.profile.contacts.map((contact) => (
                    <Card
                      key={contact.id}
                      backgroundColor="var(--dark-complementary-color)"
                      size="medium"
                    >
                      <div
                        className={`${styles.cardContent} ${!editingContacts[contact.id] ? styles.clickableCard : ""}`}
                        onClick={
                          !editingContacts[contact.id]
                            ? () => handleEditContact(contact.id, contact.value)
                            : undefined
                        }
                      >
                        <div className={styles.cardHeader}>
                          <div className={styles.cardTitleSection}>
                            <h4 className={styles.cardTitle}>
                              {contact.label}
                            </h4>
                          </div>
                          {editingContacts[contact.id] && (
                            <div className={styles.cardActions}>
                              <button
                                onClick={() => handleSaveContact(contact.id)}
                                disabled={isSaving}
                                className={styles.saveButton}
                              >
                                {isSaving ? "Salvando..." : "Salvar"}
                              </button>
                              <button
                                onClick={() => handleCancelContact(contact.id)}
                                disabled={isSaving}
                                className={styles.cancelButton}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                        {editingContacts[contact.id] ? (
                          <input
                            type="text"
                            value={contactEditData[contact.id] || ""}
                            onChange={(e) =>
                              handleChangeContact(
                                contact.id,
                                e.target.value,
                                contact.type,
                              )
                            }
                            onKeyPress={(e) =>
                              handleKeyPressContact(e, contact.id)
                            }
                            className={styles.cardInput}
                            placeholder={
                              contact.type.toLowerCase() === "whatsapp" ||
                              contact.type.toLowerCase() === "telefone"
                                ? "(00) 00000-0000"
                                : `Digite o ${contact.label.toLowerCase()}`
                            }
                            maxLength={
                              contact.type.toLowerCase() === "whatsapp" ||
                              contact.type.toLowerCase() === "telefone"
                                ? 15
                                : undefined
                            }
                            autoFocus
                          />
                        ) : (
                          <div className={styles.cardValueWithAction}>
                            <p className={styles.cardValue}>{contact.value}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openContactChannel(contact);
                              }}
                              className={`${styles.cardActionButton} ${styles[contact.type.toLowerCase()]}`}
                              title={`Abrir ${contact.label}`}
                            >
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className={styles.noProfile}>
                <p>Este anunciante ainda não possui um perfil criado.</p>
              </div>
            )}
          </section>
        </div>

        {/* Controles Administrativos - Cards individuais lado a lado */}
        <section className={commonStyles.section}>
          <div className={commonStyles.sectionHeader}>
            <div className={commonStyles.sectionTitle}>
              <Settings className={commonStyles.sectionIcon} />
              <h3>Controles Administrativos</h3>
            </div>
          </div>

          <div className={styles.adminControlsRow}>
            {/* Plano Atual */}
            <Card
              backgroundColor="var(--dark-complementary-color)"
              size="medium"
            >
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <h4 className={styles.cardTitle}>Plano Atual</h4>
                  </div>
                </div>
                <Dropdown
                  trigger={SIGNATURE_LABELS[advertiser.signature]}
                  selectedValue={SIGNATURE_LABELS[advertiser.signature]}
                  menuClassName={styles.cardDropdownMenu}
                  triggerClassName={styles.cardDropdownTrigger}
                  options={SIGNATURE_OPTIONS}
                  onSelect={(label) =>
                    updateAdvertiser({
                      signature: getSignatureKeyFromLabel(label),
                    })
                  }
                >
                  <></>
                </Dropdown>
              </div>
            </Card>

            {/* Status de Verificação */}
            <Card
              backgroundColor="var(--dark-complementary-color)"
              size="medium"
            >
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <h4 className={styles.cardTitle}>Status de Verificação</h4>
                  </div>
                </div>
                <Dropdown
                  trigger={STATUS_LABELS[advertiser.verificationStatus]}
                  selectedValue={STATUS_LABELS[advertiser.verificationStatus]}
                  menuClassName={styles.cardDropdownMenu}
                  triggerClassName={styles.cardDropdownTrigger}
                  options={STATUS_OPTIONS}
                  onSelect={(label) =>
                    updateAdvertiser({
                      verificationStatus: getStatusKeyFromLabel(label),
                    })
                  }
                >
                  <></>
                </Dropdown>
              </div>
            </Card>
          </div>
        </section>

        {/* Histórico de Assinaturas */}
        <section className={commonStyles.section}>
          <div className={commonStyles.sectionHeader}>
            <div className={commonStyles.sectionTitle}>
              <CreditCard className={commonStyles.sectionIcon} />
              <h3>Histórico de Assinaturas e Pagamentos</h3>
            </div>
          </div>

          {advertiser.subscriptions.length > 0 ? (
            <div className={styles.subscriptionsContainer}>
              <div className={styles.subscriptionsTableContainer}>
                <table className={styles.subscriptionsTable}>
                  <thead>
                    <tr>
                      <th>Plano</th>
                      <th>Status</th>
                      <th>Período</th>
                      <th>Pagamentos</th>
                      <th>Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllSubscriptions
                      ? advertiser.subscriptions
                      : advertiser.subscriptions.slice(0, 3)
                    ).map((subscription) => {
                      const totalAmount = subscription.payments.reduce(
                        (sum, payment) => sum + payment.amount,
                        0,
                      );
                      const completedPayments = subscription.payments.filter(
                        (p) => p.status === "COMPLETED",
                      ).length;

                      return (
                        <tr
                          key={subscription.id}
                          className={
                            subscription.status === "ACTIVE"
                              ? styles.activeRow
                              : ""
                          }
                        >
                          <td data-label="Plano">
                            <div className={styles.planInfo}>
                              <div className={styles.planName}>
                                {subscription.planName}
                              </div>
                              <div className={styles.planSignature}>
                                {
                                  SIGNATURE_LABELS[
                                    subscription.signature as keyof typeof SIGNATURE_LABELS
                                  ]
                                }
                              </div>
                            </div>
                          </td>
                          <td data-label="Status">
                            <span
                              className={`${styles.statusBadge} ${styles[subscription.status.toLowerCase()]}`}
                            >
                              {subscription.status === "ACTIVE" && "Ativo"}
                              {subscription.status === "EXPIRED" && "Expirado"}
                              {subscription.status === "CANCELLED" &&
                                "Cancelado"}
                              {subscription.status === "PENDING" && "Pendente"}
                              {subscription.status === "SUSPENDED" &&
                                "Suspenso"}
                            </span>
                          </td>
                          <td data-label="Período">
                            <div className={styles.periodInfo}>
                              <div>
                                {formatDate(subscription.startDate)} -{" "}
                                {formatDate(subscription.endDate)}
                              </div>
                              <div className={styles.autoRenew}>
                                {subscription.autoRenew
                                  ? "Renovação automática"
                                  : "Sem renovação"}
                              </div>
                            </div>
                          </td>
                          <td data-label="Pagamentos">
                            <div className={styles.paymentsInfo}>
                              <div className={styles.paymentsCount}>
                                {completedPayments}/
                                {subscription.payments.length} pagos
                              </div>
                              {subscription.payments.length > 0 && (
                                <div className={styles.paymentsDetails}>
                                  {subscription.payments
                                    .slice(0, 2)
                                    .map((payment) => (
                                      <div
                                        key={payment.id}
                                        className={styles.paymentItem}
                                      >
                                        <span
                                          className={`${styles.paymentStatus} ${styles[payment.status.toLowerCase()]}`}
                                        >
                                          {PAYMENT_STATUS_LABELS[
                                            payment.status as keyof typeof PAYMENT_STATUS_LABELS
                                          ] || payment.status}
                                        </span>
                                        <span className={styles.paymentAmount}>
                                          {formatCurrency(payment.amount)}
                                        </span>
                                      </div>
                                    ))}
                                  {subscription.payments.length > 2 && (
                                    <div className={styles.morePayments}>
                                      +{subscription.payments.length - 2} mais
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td data-label="Valor Total">
                            <div className={styles.totalAmount}>
                              {formatCurrency(totalAmount)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {advertiser.subscriptions.length > 3 && (
                <div className={styles.showMoreContainer}>
                  <button
                    onClick={() =>
                      setShowAllSubscriptions(!showAllSubscriptions)
                    }
                    className={styles.showMoreButton}
                  >
                    {showAllSubscriptions
                      ? "Ver menos"
                      : `Ver mais (${advertiser.subscriptions.length - 3} restantes)`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noData}>
              <p>Nenhuma assinatura encontrada</p>
            </div>
          )}
        </section>
      </div>

      {/* Popup do Slider de Imagens */}
      {showImageSlider && advertiser.profile && (
        <div className={styles.sliderPopup}>
          <div
            className={styles.sliderPopupBackdrop}
            onClick={() => setShowImageSlider(false)}
          />
          <div className={styles.sliderPopupContent}>
            <div className={styles.sliderPopupHeader}>
              <h3>Gerenciar Imagens do Perfil</h3>
              <button
                onClick={() => setShowImageSlider(false)}
                className={styles.closeButton}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.sliderContainer}>
              <Slider
                profileId={advertiser.profile.id}
                initialImages={
                  advertiser.profile.images
                    ? Array.isArray(advertiser.profile.images)
                      ? advertiser.profile.images
                      : Object.values(advertiser.profile.images)
                    : []
                }
                canEdit={true}
                signature={advertiser.signature}
                userId={advertiser.userId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
