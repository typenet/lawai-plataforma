import { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  linkText: string;
  linkHref: string;
  iconBgColor?: string;
}

export default function StatsCard({
  icon,
  title,
  value,
  linkText,
  linkHref,
  iconBgColor = "bg-navy-lighter"
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3 text-white`}>
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-medium truncate">{title}</dt>
                <dd>
                  <div className="text-lg font-medium text-neutral-dark">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-neutral-lightest px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Link href={linkHref}>
            <a className="font-medium text-navy hover:text-navy-light">
              {linkText} <span aria-hidden="true">&rarr;</span>
            </a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
