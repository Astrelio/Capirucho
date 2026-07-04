export type AuthView = 'login' | 'register' | 'forgot';

export interface AuthFormProps {
  onSwitch: (view: AuthView) => void;
}
