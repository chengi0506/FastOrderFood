import React from 'react';
import { useTranslation } from 'react-i18next';

function NewChatButton({ onNewChat }) {
  const { t } = useTranslation();

  return (
    <button className="new-chat-button" onClick={onNewChat}>
      {t('newChat')}
    </button>
  );
}

export default NewChatButton;
