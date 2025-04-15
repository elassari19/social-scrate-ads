import Link from 'next/link';
import { Typography } from '../../ui/Typography';

interface IProps {
  items: {
    title: string;
    list: {
      title: string;
      href: string;
      icon?: any;
      description?: string;
    }[];
  }[];
}

export function ProductMenu({ items }: IProps) {
  return (
    <div className="w-full">
      <div className="container flex flex-col md:flex-row gap-1 p-4">
        {items.map((menue, idx) => (
          <div key={idx} className="w-full md:min-w-[15rem]">
            <Typography variant="h6" className="text-nowrap mb-4">
              {menue.title}
            </Typography>
            {menue.list.map((line) => (
              <Link
                key={line.title}
                href={line.href}
                className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-muted text-nowrap"
              >
                {line.icon && (
                  <div className="rounded-md border p-2">
                    <line.icon className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{line.title}</h3>
                  {line.description && (
                    <p className="text-sm text-muted-foreground">
                      {line.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
