"use client";

import { useState } from "react";
import styles from "./ProductLocation.module.css";

import { HiLocationMarker } from "react-icons/hi";
import { FaLocationArrow } from "react-icons/fa6";
import { TbHomeCheck } from "react-icons/tb";
import { HiOutlinePencil } from "react-icons/hi2";

import type { Producer } from "@/types/Producer";

interface ProductLocationProps {
  producer: Producer;
  canEdit: boolean;
}

function ProductLocation({ producer, canEdit }: ProductLocationProps) {
  const [isEditing, setIsEditing] = useState(false);

  //----- Locality -----

  const [userLocality, setUserLocality] = useState({
    country: producer.user.locality?.country || "Brasil",
    state: producer.user.locality?.state || "",
    city: producer.user.locality?.city || "",
    neighborhood: producer.user.locality?.neighborhood || "",
  });

  console.log(producer);

  const [locations, setLocations] = useState(producer.profile.locations);

  const LOCATIONS_OPTIONS = [
    { id: 1, name: "a_domicilio", label: "À Domicílio" },
    { id: 2, name: "hoteis", label: "Hotéis" },
    { id: 3, name: "moteis", label: "Motéis" },
    { id: 4, name: "eventos", label: "Eventos" },
  ];

  //----- Local -----

  const [hasLocal, setHasLocal] = useState(producer.profile.hasLocal);

  const [local, setLocal] = useState({
    cep: producer.profile.local?.cep || "",
    country: producer.profile.local?.country || "Brasil",
    state: producer.profile.local?.state || "",
    city: producer.profile.local?.city || "",
    neighborhood: producer.profile.local?.neighborhood || "",
    street: producer.profile.local?.street || "",
    number: producer.profile.local?.number || "",
    complement: producer.profile.local?.complement || "",
  });

  const [amenities, setAmenities] = useState(
    producer.profile.local?.amenities || []
  );

  const AMENITIES_OPTIONS = [
    { id: 1, name: "ar_condicionado", label: "Ar Condicionado" },
    { id: 2, name: "cama_queen", label: "Cama Queen" },
    { id: 3, name: "cama_king", label: "Cama King" },
    { id: 4, name: "sofa", label: "Sofá" },
    { id: 5, name: "televisao", label: "Televisão" },
    { id: 6, name: "chuveiro", label: "Chuveiro" },
    { id: 7, name: "chuveiro_quente", label: "Chuveiro Quente" },
    { id: 8, name: "banheira", label: "Banheira" },
    { id: 9, name: "jacuzzi", label: "Jacuzzi" },
    { id: 10, name: "toalhas_limpas", label: "Toalhas Limpas" },
    { id: 11, name: "produtos_de_higiene", label: "Produtos de Higiene" },
    { id: 12, name: "preservativos", label: "Preservativos" },
    { id: 13, name: "wifi", label: "Wi-Fi" },
    { id: 14, name: "frigobar", label: "Frigobar" },
    { id: 15, name: "estacionamento", label: "Estacionamento" },
  ];

  const [originalLocal, setOriginalLocal] = useState(local);
  const [originalLocations, setOriginalLocations] = useState(locations);
  const [originalAmenities, setOriginalAmenities] = useState(amenities);
  const [originalUserLocality, setOriginalUserLocality] =
    useState(userLocality);
  const [originalHasLocal, setOriginalHasLocal] = useState(hasLocal);

  async function fetchCEP(cep: string) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        console.warn("CEP não encontrado");
        return;
      }

      setLocal((prev) => ({
        ...prev,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));
    } catch (err) {
      console.error("Erro buscando CEP:", err);
    }
  }

  const handleEdit = () => {
    setOriginalLocal(local);
    setOriginalLocations(locations);
    setOriginalAmenities(amenities);
    setOriginalUserLocality(userLocality);
    setOriginalHasLocal(hasLocal);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setLocal(originalLocal);
    setLocations(originalLocations);
    setAmenities(originalAmenities);
    setUserLocality(originalUserLocality);
    setHasLocal(originalHasLocal);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // Formatar locations com option
      const locationsPayload = locations.map((loc) => ({
        locationId: loc.option.id,
        option: {
          id: loc.option.id,
          name: loc.option.name,
          label: loc.option.label,
        },
      }));

      // Formatar amenities com option
      const amenitiesPayload = amenities.map((a) => ({
        amenityId: a.option.id,
        option: {
          id: a.option.id,
          name: a.option.name,
          label: a.option.label,
        },
      }));

      await fetch("/api/profile/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: producer.user.id,
          profileId: producer.profile.id,
          locality: userLocality,
          hasLocal,
          local,
          amenities: amenitiesPayload,
          locations: locationsPayload,
        }),
      });

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="location" className={styles.productLocation}>
      <div className={styles.layout}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>
              <HiLocationMarker />
            </span>
            Localidades
          </h2>

          {canEdit ? (
            !isEditing ? (
              <button className={styles.editBtn} onClick={handleEdit}>
                Editar <HiOutlinePencil />
              </button>
            ) : (
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                  Salvar
                </button>
                <button className={styles.cancelBtn} onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            )
          ) : null}
        </div>

        <div className={styles.content}>
          <div className={`${styles.column} ${styles.conditional}`}>
            {isEditing ? (
              <>
                <label htmlFor="hasLocal" className={styles.hasLocal}>
                  <input
                    type="checkbox"
                    id="hasLocal"
                    checked={hasLocal}
                    onChange={(e) => setHasLocal(e.target.checked)}
                  />
                  Possui Local?
                </label>

                {hasLocal && (
                  <>
                    <div className={styles.line}>
                      <label htmlFor="">
                        CEP:
                        <input
                          type="text"
                          placeholder="CEP"
                          value={local.cep}
                          onChange={(e) => {
                            const cep = e.target.value;
                            setLocal({ ...local, cep });
                            fetchCEP(cep);
                          }}
                        />
                      </label>

                      <label htmlFor="">
                        Estado
                        <input
                          type="text"
                          placeholder="Estado"
                          value={local.state}
                          disabled={true}
                          onChange={(e) =>
                            setLocal({ ...local, state: e.target.value })
                          }
                        />
                      </label>

                      <label htmlFor="">
                        Cidade:
                        <input
                          type="text"
                          placeholder="Cidade"
                          value={local.city}
                          disabled={true}
                          onChange={(e) =>
                            setLocal({ ...local, city: e.target.value })
                          }
                        />
                      </label>

                      <label htmlFor="">
                        Bairro:
                        <input
                          type="text"
                          placeholder="Bairro"
                          value={local.neighborhood}
                          disabled={true}
                          onChange={(e) =>
                            setLocal({
                              ...local,
                              neighborhood: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label htmlFor="">
                        Rua:
                        <input
                          type="text"
                          placeholder="Rua"
                          value={local.street}
                          disabled={true}
                          onChange={(e) =>
                            setLocal({ ...local, street: e.target.value })
                          }
                        />
                      </label>

                      <label htmlFor="">
                        Número:
                        <input
                          type="text"
                          placeholder="Número"
                          value={local.number}
                          onChange={(e) =>
                            setLocal({ ...local, number: e.target.value })
                          }
                        />
                      </label>

                      <label htmlFor="">
                        Complemento:
                        <input
                          type="text"
                          placeholder="Complemento"
                          value={local.complement || ""}
                          onChange={(e) =>
                            setLocal({ ...local, complement: e.target.value })
                          }
                        />
                      </label>
                    </div>

                    <div className={styles.line}>
                      <h3 className={styles.columnTitle}>Comodidades</h3>
                      {AMENITIES_OPTIONS.map((opt) => {
                        const exists = amenities.some(
                          (a) => a.option.label === opt.label
                        );

                        return (
                          <label key={opt.id} className={styles.checkboxItem}>
                            <input
                              type="checkbox"
                              checked={exists}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAmenities([
                                    ...amenities,
                                    {
                                      amenityId: opt.id,
                                      option: {
                                        id: opt.id,
                                        name: opt.name,
                                        label: opt.label,
                                      },
                                    },
                                  ]);
                                } else {
                                  setAmenities(
                                    amenities.filter(
                                      (a) => a.option.id !== opt.id
                                    )
                                  );
                                }
                              }}
                            />
                            {opt.id}. {opt.label}
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              hasLocal && (
                <>
                  <div className={styles.line}>
                    <h3 className={styles.columnTitle}>
                      <span>
                        <TbHomeCheck />
                      </span>
                      Minha Localidade
                    </h3>

                    <p className={styles.address}>
                      {local.neighborhood}, {local.city} - {local.state}
                    </p>
                  </div>

                  <div className={styles.line}>
                    <h3 className={styles.columnTitle}>Comodidades</h3>
                    <p>
                      {amenities.length === 0
                        ? "Nenhuma informada."
                        : amenities.map((a) => a.option.label).join(", ")}
                    </p>
                  </div>
                </>
              )
            )}
          </div>

          <div className={styles.column}>
            <div className={styles.line}>
              <h3 className={styles.columnTitle}>
                <span>
                  <FaLocationArrow />
                </span>
                Minha Localização
              </h3>

              {!isEditing ? (
                <p className={styles.address}>
                  {userLocality?.neighborhood} - {userLocality?.city},{" "}
                  {userLocality?.state}
                </p>
              ) : (
                <div className={styles.editGroup}>
                  {" "}
                  <label htmlFor="">
                    Estado:
                    <input
                      type="text"
                      placeholder="Estado"
                      value={userLocality?.state || ""}
                      onChange={(e) =>
                        setUserLocality({
                          ...userLocality,
                          state: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label htmlFor="">
                    Cidade:
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={userLocality?.city || ""}
                      onChange={(e) =>
                        setUserLocality({
                          ...userLocality,
                          city: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label htmlFor="">
                    Bairro:
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={userLocality?.neighborhood || ""}
                      onChange={(e) =>
                        setUserLocality({
                          ...userLocality,
                          neighborhood: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              )}
            </div>

            <div className={styles.line}>
              <h3 className={styles.columnTitle}>Locais que Atendo</h3>

              {!isEditing ? (
                <p className={styles.address}>
                  {locations.length === 0
                    ? "Não Informado"
                    : locations.map((loc) => loc.option.label).join(", ")}
                </p>
              ) : (
                <>
                  {LOCATIONS_OPTIONS.map((opt) => {
                    const exists = locations.some(
                      (l) => l.option.label === opt.label
                    );

                    return (
                      <label key={opt.id} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={exists}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocations([
                                ...locations,
                                {
                                  locationId: opt.id,
                                  option: {
                                    id: opt.id,
                                    name: opt.name,
                                    label: opt.label,
                                  },
                                },
                              ]);
                            } else {
                              setLocations(
                                locations.filter(
                                  (l) => l.option.label !== opt.label
                                )
                              );
                            }
                          }}
                        />
                        {opt.id}. {opt.label}
                      </label>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductLocation;
