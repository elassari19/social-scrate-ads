import { CheckCircle } from 'lucide-react';
import React from 'react';
import { cn } from '../../lib/utils';
import Link from 'next/link';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  actor: {
    id: number;
    title: string;
    namespace: string;
    description: string;
    stars: string;
    rating: number;
    authorName: string;
    authorBadgeColor: string;
    icon: string;
    iconBg: string;
  };
}

const ActorCard = ({ actor, className }: IProps) => {
  return (
    <Link
      href={`/actors/${actor.namespace}`}
      className={cn(
        'bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-center mb-4">
        <div
          className={`w-12 h-12 ${actor.iconBg} rounded-lg flex items-center justify-center mr-4 text-xl`}
        >
          {actor.icon}
        </div>
        <div>
          <h3 className="font-bold">{actor.title}</h3>
          <p className="text-xs text-gray-500">{actor.namespace}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4 h-12">{actor.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span
            className={`${actor.authorBadgeColor} rounded-full w-5 h-5 mr-1 flex items-center justify-center text-xs`}
          >
            {actor.authorName.charAt(0)}
          </span>
          <span className="text-sm flex items-center">
            {actor.authorName}
            {actor.authorName === 'Tonfy' && (
              <CheckCircle className="h-3.5 w-3.5 ml-1 text-blue-500 fill-white" />
            )}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{actor.stars}</span>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-1">★</span>
            <span className="text-sm text-gray-500">{actor.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ActorCard;
