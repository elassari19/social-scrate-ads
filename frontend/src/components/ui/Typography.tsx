import { HtmlHTMLAttributes } from 'react';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

interface TypographyProps extends HtmlHTMLAttributes<HTMLHeadingElement> {
  variant?: Variant;
}

const variantClasses = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-bold',
  h3: 'text-2xl font-bold',
  h4: 'text-xl font-bold',
  h5: 'text-lg font-bold',
  h6: 'text-base font-bold',
  p: 'text-base',
  span: 'text-base',
};

export function Typography({
  variant = 'p',
  children,
  className,
  ...props
}: TypographyProps) {
  const Component = variant;
  const combinedClassName = `${variantClasses[variant]} ${className || ''}`;

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
}
