import React from 'react';
import type { MenuItem } from '../../../types';

interface CustomizationSelectorProps {
  customizations?: MenuItem['customizations'];
  selectedAddOns: Record<string, boolean>;
  onToggleAddOn: (id: string) => void;
}

export const CustomizationSelector: React.FC<CustomizationSelectorProps> = ({
  customizations,
  selectedAddOns,
  onToggleAddOn,
}) => {
  if (!customizations || customizations.length === 0) return null;

  return (
    <div className="fdp-customization-section">
      <h3 className="fdp-section-heading">Customise Your Order</h3>
      {customizations.map((sec, sIdx) => (
        <div key={sIdx} className="fdp-addon-group">
          <span className="fdp-addon-group-title">{sec.title}</span>
          <div className="fdp-addon-list">
            {sec.options.map((opt) => {
              const isChecked = Boolean(selectedAddOns[opt.id]);
              return (
                <label
                  key={opt.id}
                  className={`fdp-addon-card ${isChecked ? 'selected' : ''}`}
                >
                  <div className="fdp-addon-left">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleAddOn(opt.id)}
                      className="fdp-addon-checkbox"
                    />
                    <span className="fdp-addon-name">{opt.name}</span>
                  </div>
                  <span className="fdp-addon-price">+₹{opt.price.toFixed(0)}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
