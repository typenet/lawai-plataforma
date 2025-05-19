import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isActive?: boolean;
  onSelect: () => void;
}

export default function PlanCard({
  name,
  price,
  description,
  features,
  isPopular = false,
  isActive = false,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300",
        isPopular ? "border-gold transform scale-105 z-10" : "border-neutral-light",
        isActive ? "ring-2 ring-navy" : ""
      )}
    >
      {isPopular && (
        <div className="bg-gold text-white text-center text-sm font-medium py-1">
          Mais Popular
        </div>
      )}
      
      <div className="p-5">
        <h3 className="text-lg font-medium text-navy">{name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-extrabold text-navy">{price}</span>
          <span className="ml-1 text-xl font-medium text-neutral-medium">/mês</span>
        </div>
        <p className="mt-5 text-sm text-neutral-dark">{description}</p>
      </div>
      
      <div className="px-5 pt-5">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                {feature.included ? (
                  <CheckIcon className="text-green-500 h-5 w-5" />
                ) : (
                  <XIcon className="text-red-500 h-5 w-5" />
                )}
              </div>
              <p
                className={cn(
                  "ml-3 text-sm",
                  feature.included ? "text-neutral-dark" : "text-neutral-medium"
                )}
              >
                {feature.name}
              </p>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="px-5 py-5 mt-5">
        <Button
          type="button"
          onClick={onSelect}
          className={cn(
            "w-full",
            isActive
              ? "bg-navy hover:bg-navy-light text-white"
              : "border border-navy text-navy bg-white hover:bg-neutral-lightest"
          )}
          variant={isActive ? "default" : "outline"}
        >
          {isActive ? "Plano Atual" : "Selecionar"}
        </Button>
      </div>
    </div>
  );
}
