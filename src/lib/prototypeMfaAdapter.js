import { usePrototypeStore } from '@/stores/prototypeStore';

/**
 * Prototype MFA session adapter.
 *
 * Implements the session interface required by MfaManage and MfaMethodSetup,
 * synchronizing two-factor configuration directly with prototypeStore.account.mfa
 * and securityActivity without requiring a live backend.
 */
export function createPrototypeMfaSession() {
  let pendingPhone = null;

  return {
    async status() {
      const state = usePrototypeStore.getState();
      const mfa = state.account?.mfa || {};
      const methods = [];
      if (mfa.totp) methods.push('totp');
      if (mfa.sms) methods.push('sms');
      return {
        methods,
        phone_hint: mfa.phone || undefined,
      };
    },

    async setupAuthenticator() {
      return {
        secret: 'YUEORA2FASECRETKEY77',
        uri: 'otpauth://totp/Yueora:you@example.com?secret=YUEORA2FASECRETKEY77&issuer=Yueora',
      };
    },

    async confirmAuthenticator(code) {
      if (!code || code.length < 6) {
        throw new Error('Please enter the full 6-digit code');
      }
      usePrototypeStore.getState().setMfaMethod('totp', true);
      usePrototypeStore.getState().addSecurityActivity({
        type: 'mfa',
        title: 'Authenticator app enabled',
        detail: 'Time-based one-time passcodes (TOTP) activated',
      });
      return { success: true };
    },

    async sendPhoneCode(phone) {
      pendingPhone = phone;
      return true;
    },

    async confirmPhone(code) {
      if (!code || code.length < 6) {
        throw new Error('Please enter the full 6-digit code');
      }
      const phoneHint = pendingPhone ? `••• ••• ${pendingPhone.slice(-4)}` : '••• ••• 4242';
      usePrototypeStore.getState().setMfaMethod('sms', true, { phone: phoneHint });
      usePrototypeStore.getState().addSecurityActivity({
        type: 'mfa',
        title: 'Text-message MFA enabled',
        detail: 'SMS verification codes activated',
      });
      return { success: true };
    },

    async sendProofCode() {
      return true;
    },

    async removeMethod(method, code) {
      if (!code || code.length < 6) {
        throw new Error('Please enter the full 6-digit code');
      }
      if (method === 'totp') {
        usePrototypeStore.getState().setMfaMethod('totp', false);
        usePrototypeStore.getState().addSecurityActivity({
          type: 'mfa',
          title: 'MFA method disabled',
          detail: 'Authenticator app disabled',
        });
      } else if (method === 'sms') {
        usePrototypeStore.getState().setMfaMethod('sms', false, { phone: null });
        usePrototypeStore.getState().addSecurityActivity({
          type: 'mfa',
          title: 'MFA method disabled',
          detail: 'Text-message verification disabled',
        });
      }
      return true;
    },

    async forgetDevices() {
      return true;
    },
  };
}
