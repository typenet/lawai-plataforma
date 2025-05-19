import { useState, useEffect } from 'react';

type ABTestVariant = 'A' | 'B';

interface ABTestConfig {
  testId: string;
  defaultVariant?: ABTestVariant;
  persistInStorage?: boolean;
}

/**
 * Hook para gerenciar testes A/B no sistema
 * 
 * @param config Configuração do teste A/B
 * @returns A variante atual (A ou B) e funções para interagir com o teste
 */
export function useABTest(config: ABTestConfig) {
  const { testId, defaultVariant = 'A', persistInStorage = true } = config;
  const storageKey = `ab_test_${testId}`;
  
  // Inicializa o estado com o valor do localStorage ou aleatório
  const getInitialVariant = (): ABTestVariant => {
    if (persistInStorage) {
      const storedVariant = localStorage.getItem(storageKey) as ABTestVariant | null;
      if (storedVariant === 'A' || storedVariant === 'B') {
        return storedVariant;
      }
    }
    
    // Se não tivermos um valor salvo, atribuímos aleatoriamente ou usamos o padrão
    if (Math.random() >= 0.5) {
      return 'B';
    }
    return defaultVariant;
  };

  const [variant, setVariant] = useState<ABTestVariant>(getInitialVariant);

  useEffect(() => {
    if (persistInStorage) {
      localStorage.setItem(storageKey, variant);
    }
  }, [variant, storageKey, persistInStorage]);

  const isVariantA = variant === 'A';
  const isVariantB = variant === 'B';

  // Função para forçar uma variante específica (útil para debugging)
  const setTestVariant = (newVariant: ABTestVariant) => {
    setVariant(newVariant);
  };

  return {
    variant,
    isVariantA,
    isVariantB,
    setTestVariant
  };
}