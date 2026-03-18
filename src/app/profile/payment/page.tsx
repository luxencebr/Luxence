"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card/Card";
import LoadingContainer from "@/components/ui/LoadingContainer/LoadingContainer";
import styles from "./payment.module.css";

interface PaymentMethod {
  id: string;
  type: "credit_card" | "pix" | "bank_transfer";
  name: string;
  details: string;
  isDefault: boolean;
}

export default function PaymentPage() {
  const { data: session } = useSession();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<"credit_card" | "pix" | "bank_transfer">("credit_card");

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/profile/payment");
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data.paymentMethods || []);
        }
      } catch (error) {
        console.error("Erro ao carregar métodos de pagamento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchPaymentMethods();
    }
  }, [session]);

  const handleAddMethod = () => {
    // Aqui você implementaria a lógica para adicionar um método de pagamento
    alert("Funcionalidade de adicionar método de pagamento será implementada em breve!");
  };

  const handleRemoveMethod = (methodId: string) => {
    // Aqui você implementaria a lógica para remover um método de pagamento
    alert(`Funcionalidade de remover método ${methodId} será implementada em breve!`);
  };

  const handleSetDefault = (methodId: string) => {
    // Aqui você implementaria a lógica para definir como padrão
    alert(`Funcionalidade de definir método ${methodId} como padrão será implementada em breve!`);
  };

  if (isLoading) {
    return <LoadingContainer message="Carregando métodos de pagamento..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Métodos de Pagamento</h2>
        <p className={styles.subtitle}>
          Gerencie seus métodos de pagamento para assinaturas e serviços
        </p>
      </div>

      <div className={styles.content}>
        {paymentMethods.length === 0 ? (
          <Card backgroundColor="var(--dark-complementary-color)">
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💳</div>
              <h3 className={styles.emptyTitle}>Nenhum método de pagamento</h3>
              <p className={styles.emptyDescription}>
                Adicione um método de pagamento para facilitar suas compras e assinaturas
              </p>
              <button
                onClick={() => setIsAddingMethod(true)}
                className={styles.addButton}
              >
                Adicionar Método
              </button>
            </div>
          </Card>
        ) : (
          <>
            <div className={styles.methodsList}>
              {paymentMethods.map((method) => (
                <Card key={method.id} backgroundColor="var(--dark-complementary-color)">
                  <div className={styles.methodCard}>
                    <div className={styles.methodInfo}>
                      <div className={styles.methodHeader}>
                        <h4 className={styles.methodName}>{method.name}</h4>
                        {method.isDefault && (
                          <span className={styles.defaultBadge}>Padrão</span>
                        )}
                      </div>
                      <p className={styles.methodDetails}>{method.details}</p>
                      <div className={styles.methodType}>
                        {method.type === "credit_card" && "Cartão de Crédito"}
                        {method.type === "pix" && "PIX"}
                        {method.type === "bank_transfer" && "Transferência Bancária"}
                      </div>
                    </div>
                    <div className={styles.methodActions}>
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className={styles.setDefaultButton}
                        >
                          Definir como Padrão
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMethod(method.id)}
                        className={styles.removeButton}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className={styles.addMethodSection}>
              <button
                onClick={() => setIsAddingMethod(true)}
                className={styles.addButton}
              >
                + Adicionar Novo Método
              </button>
            </div>
          </>
        )}

        {isAddingMethod && (
          <Card backgroundColor="var(--dark-complementary-color)">
            <div className={styles.addMethodForm}>
              <h3 className={styles.formTitle}>Adicionar Método de Pagamento</h3>
              
              <div className={styles.methodTypeSelector}>
                <label className={styles.label}>Tipo de Pagamento</label>
                <select
                  value={newMethodType}
                  onChange={(e) => setNewMethodType(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="pix">PIX</option>
                  <option value="bank_transfer">Transferência Bancária</option>
                </select>
              </div>

              <div className={styles.formNote}>
                <p>
                  Esta funcionalidade está em desenvolvimento. Em breve você poderá
                  adicionar e gerenciar seus métodos de pagamento diretamente aqui.
                </p>
              </div>

              <div className={styles.formActions}>
                <button
                  onClick={handleAddMethod}
                  className={styles.saveButton}
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setIsAddingMethod(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
