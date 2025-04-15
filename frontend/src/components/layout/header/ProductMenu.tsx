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
    <div className="w-full shadow-lg md:w-[700px]">
      <div className="container grid grid-cols-1 gap-2 p-6 md:grid-cols-2">
        {items.map((menue, idx) => (
          <div key={idx} className="grid gap-0.5">
            <Typography variant="h5" className="col-span-full">
              {menue.title}
            </Typography>
            {menue.list.map((line) => (
              <Link
                key={line.title}
                href={line.href}
                className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted"
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
