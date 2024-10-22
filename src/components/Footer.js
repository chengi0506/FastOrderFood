import React from 'react';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>{t('footerText')}</p>
      </div>
    </footer>
  );
}

export default Footer;
