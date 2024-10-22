import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('typeMessage')}
      />
      <button onClick={handleSend}>{t('send')}</button>
    </div>
  );
}

export default ChatInput;
