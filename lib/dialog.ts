import { create } from 'zustand';

interface DialogState {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  message: string;
  resolve: ((value: boolean | void) => void) | null;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  close: (value: boolean) => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  message: '',
  resolve: null,
  showAlert: (message: string) => {
    return new Promise((resolve) => {
      set({ isOpen: true, type: 'alert', message, resolve: resolve as any });
    });
  },
  showConfirm: (message: string) => {
    return new Promise((resolve) => {
      set({ isOpen: true, type: 'confirm', message, resolve: resolve as any });
    });
  },
  close: (value: boolean) => {
    const { resolve } = get();
    if (resolve) resolve(value);
    set({ isOpen: false, resolve: null });
  }
}));

export const appAlert = (message: string) => useDialogStore.getState().showAlert(message);
export const appConfirm = (message: string) => useDialogStore.getState().showConfirm(message);
