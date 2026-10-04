import React from 'react';
import { ShieldAlert } from 'lucide-react';
import StateMessage from '@/components/patterns/StateMessage';

const UserNotRegisteredError = () => {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-canvas px-4">
      <StateMessage
        tone="warning"
        icon={ShieldAlert}
        title="Access restricted"
        description="You are not registered to use this application. Please contact the app administrator to request access."
      />
    </div>
  );
};

export default UserNotRegisteredError;