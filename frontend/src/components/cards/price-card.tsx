import { cn } from '../../lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';

interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: 'default' | 'outline';
  popular?: boolean;
  note?: string;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  buttonVariant = 'default',
  popular,
  note,
}: PricingCardProps) {
  return (
    <Card
      className={cn('flex flex-col', popular && 'border-primary shadow-md')}
    >
      <CardHeader>
        {popular && (
          <Badge className="w-fit mb-2" variant="default">
            Most popular
          </Badge>
        )}
        <CardTitle>{title}</CardTitle>
        <div className="flex items-baseline text-2xl font-bold">
          ${price}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            / monthly & pay as you go
          </span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button variant={buttonVariant} className="w-full">
          {buttonText}
        </Button>
        {note && <p className="text-xs text-muted-foreground mt-2">{note}</p>}
      </CardFooter>
    </Card>
  );
}
