import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/LanguageSelector.css';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="language-selector">
      <select onChange={changeLanguage} value={i18n.language}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
