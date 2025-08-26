import React, { useState } from 'react';
import './Sidebar.css';

interface SidebarSection {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface SidebarProps {
  sections: SidebarSection[];
}

export const Sidebar: React.FC<SidebarProps> = ({ sections }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultOpen).map(s => s.id))
  );
  
  const toggleSection = (sectionId: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(sectionId)) {
      newOpen.delete(sectionId);
    } else {
      newOpen.add(sectionId);
    }
    setOpenSections(newOpen);
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🚇 London Underground</h2>
        <span className="sidebar-subtitle">Hotels & Journey Planner</span>
      </div>
      
      <div className="sidebar-sections">
        {sections.map(section => (
          <div key={section.id} className="sidebar-section">
            <button
              className="section-header"
              onClick={() => toggleSection(section.id)}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-title">{section.title}</span>
              <span className={`section-arrow ${openSections.has(section.id) ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            
            {openSections.has(section.id) && (
              <div className="section-content">
                {section.children}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <a 
          href="https://github.com/jonathanleahy/underground" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
        >
          View on GitHub →
        </a>
      </div>
    </div>
  );
};