import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center bg-[#9F85FF] rounded-md p-1.5">
                <svg className="h-6 w-auto text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2z" />
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-[#9F85FF]">LawAI</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/">
              <span className={`${isActive("/") ? "text-navy" : "text-neutral-dark"} hover:text-navy font-medium cursor-pointer`}>
                Início
              </span>
            </Link>
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <span className={`${isActive("/dashboard") ? "text-navy" : "text-neutral-dark"} hover:text-navy font-medium cursor-pointer`}>
                Dashboard
              </span>
            </Link>
            <Link href="/documentos">
              <span className={`${isActive("/documentos") ? "text-navy" : "text-neutral-dark"} hover:text-navy font-medium cursor-pointer`}>
                Documentos
              </span>
            </Link>
            <Link href="/clientes">
              <span className={`${isActive("/clientes") ? "text-navy" : "text-neutral-dark"} hover:text-navy font-medium cursor-pointer`}>
                Clientes
              </span>
            </Link>
            
            <div className="relative ml-3">
              <div className="flex items-center space-x-3">
                {!isAuthenticated ? (
                  <Button 
                    variant="default" 
                    className="bg-[#9F85FF] hover:bg-[#8A6EF3] text-white font-medium"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Entrar
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user?.profileImageUrl || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"}
                        alt="Perfil do usuário"
                      />
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer">
                          Dashboard
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/documentos">
                        <DropdownMenuItem className="cursor-pointer">
                          Documentos
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-dark hover:text-navy hover:bg-neutral-lightest focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive("/") ? "text-navy bg-neutral-lightest" : "text-neutral-dark hover:text-navy hover:bg-neutral-lightest"}`}>
                Início
              </span>
            </Link>
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive("/dashboard") ? "text-navy bg-neutral-lightest" : "text-neutral-dark hover:text-navy hover:bg-neutral-lightest"}`}>
                Dashboard
              </span>
            </Link>
            <Link href="/planos">
              <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive("/planos") ? "text-navy bg-neutral-lightest" : "text-neutral-dark hover:text-navy hover:bg-neutral-lightest"}`}>
                Planos
              </span>
            </Link>
            <Link href="/recursos">
              <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive("/recursos") ? "text-navy bg-neutral-lightest" : "text-neutral-dark hover:text-navy hover:bg-neutral-lightest"}`}>
                Recursos
              </span>
            </Link>
          </div>
          
          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={user?.profileImageUrl || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"}
                    alt="Perfil do usuário"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-neutral-dark">{user?.firstName || 'Usuário'}</div>
                  <div className="text-sm font-medium text-neutral-medium">{user?.email || ''}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/dashboard">
                  <span className="block px-4 py-2 text-base font-medium text-neutral-dark hover:text-navy hover:bg-neutral-lightest cursor-pointer">
                    Dashboard
                  </span>
                </Link>
                <Link href="/documentos">
                  <span className="block px-4 py-2 text-base font-medium text-neutral-dark hover:text-navy hover:bg-neutral-lightest cursor-pointer">
                    Documentos
                  </span>
                </Link>
                <a 
                  href="/api/logout"
                  className="block px-4 py-2 text-base font-medium text-neutral-dark hover:text-navy hover:bg-neutral-lightest"
                >
                  Sair
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
