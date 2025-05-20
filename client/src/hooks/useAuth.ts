import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import { useState, useEffect } from "react";

// Usuário simulado para desenvolvimento
const mockUser: User = {
  id: "999999",
  email: "advogado@exemplo.com",
  firstName: "Advogado",
  lastName: "Exemplo",
  profileImageUrl: "https://ui-avatars.com/api/?name=Advogado&background=9F85FF&color=fff",
  subscription: {
    id: "sub_1",
    planId: "professional",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
};

export function useAuth() {
  // Em modo de desenvolvimento, usamos um usuário simulado
  const [devMode, setDevMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: apiUser, isLoading: apiLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !devMode, // Só faz a requisição se não estiver em modo de desenvolvimento
  });
  
  // Usuário final: ou o mockado (dev) ou o da API
  const user = devMode ? mockUser : apiUser;
  
  return {
    user,
    isLoading: devMode ? false : apiLoading,
    isAuthenticated: true, // Sempre autenticado em modo de desenvolvimento
  };
}
