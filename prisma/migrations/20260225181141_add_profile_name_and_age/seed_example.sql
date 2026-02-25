-- Exemplo de como popular os dados de nome e idade do perfil
-- Este arquivo é apenas para referência, não será executado automaticamente

-- Exemplo: Copiar o nome do Producer para o ProducerProfile
-- UPDATE ProducerProfile pp
-- JOIN Producer p ON pp.producerId = p.id
-- SET pp.name = p.name
-- WHERE pp.name IS NULL;

-- Exemplo: Definir uma idade padrão (opcional)
-- IMPORTANTE: A idade deve estar entre 18 e 99 anos
-- UPDATE ProducerProfile
-- SET age = 25
-- WHERE age IS NULL;
