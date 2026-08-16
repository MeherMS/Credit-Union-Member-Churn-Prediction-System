'use client';

import { Mail, Globe, Bot, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface SocialLink {
  name: string;
  icon: LucideIcon | string;
  url: string;
  color: string;
}

export default function Footer() {
  const socialLinks: SocialLink[] = [
    {
      name: 'LinkedIn',
      icon: '💼',
      url: 'https://linkedin.com/in/meherms',
      color: 'hover:text-blue-600',
    },
    {
      name: 'GitHub',
      icon: '💻',
      url: 'https://github.com/meherMS',
      color: 'hover:text-gray-900',
    },
    {
      name: 'Portfolio',
      icon: Globe,
      url: 'https://meherms.github.io',
      color: 'hover:text-purple-600',
    },
    {
      name: 'MS-Robot',
      icon: Bot,
      url: 'https://ms-robot.vercel.app/',
      color: 'hover:text-green-600',
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:selmi.ms1995@gmail.com',
      color: 'hover:text-red-600',
    },
  ];

  const renderIcon = (icon: LucideIcon | string): ReactNode => {
    if (typeof icon === 'string') {
      return <span className="text-sm">{icon}</span>;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent size={16} />;
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-6">
      <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Left Side: Credit */}
        <div className="text-center md:text-left">
          <p className="text-xs text-gray-700">
            Credit Union Churn Prediction System | Developed by <span className="font-semibold text-gray-900">Meher Selmi, Lead Data Science</span>
          </p>
        </div>

        {/* Middle: Project GitHub Link */}
        <a
          href="https://github.com/MeherMS/Credit-Union-Member-Churn-Prediction-System"
          target="_blank"
          rel="noopener noreferrer"
          title="View Project on GitHub"
          className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
        >
          <span>🔗</span>
          <span>View Project on GitHub</span>
        </a>

        {/* Right Side: Contact Me + Social Links */}
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-gray-800">Contact me:</p>
          <div className="flex gap-4 items-center">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.name}
                className={`text-gray-600 transition-colors duration-200 ${link.color} inline-flex`}
              >
                {renderIcon(link.icon)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}