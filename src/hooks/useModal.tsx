import React, { useState, useCallback } from 'react';
import CustomModal, { ModalButton } from '../components/CustomModal';

interface ModalConfig {
  title: string;
  message?: string;
  icon?: string;
  iconColor?: string;
  buttons: ModalButton[];
}

interface UseModalReturn {
  Modal: React.FC;
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
  showAlert: (title: string, message?: string, buttons?: ModalButton[]) => void;
  showConfirm: (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => void;
  showSuccess: (title: string, message?: string, onClose?: () => void) => void;
  showError: (title: string, message?: string, onClose?: () => void) => void;
  showInfo: (title: string, message?: string, onClose?: () => void) => void;
}

export function useModal(): UseModalReturn {
  const [visible, setVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: '',
    buttons: [],
  });

  const showModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
  }, []);

  const showAlert = useCallback(
    (title: string, message?: string, buttons?: ModalButton[]) => {
      showModal({
        title,
        message,
        buttons: buttons || [{ text: 'OK', onPress: hideModal }],
      });
    },
    [showModal, hideModal]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message?: string,
      onConfirm?: () => void,
      onCancel?: () => void
    ) => {
      showModal({
        title,
        message,
        icon: 'warning',
        iconColor: '#f59e0b',
        buttons: [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              hideModal();
              onCancel?.();
            },
          },
          {
            text: 'Confirmar',
            style: 'destructive',
            onPress: () => {
              hideModal();
              onConfirm?.();
            },
          },
        ],
      });
    },
    [showModal, hideModal]
  );

  const showSuccess = useCallback(
    (title: string, message?: string, onClose?: () => void) => {
      showModal({
        title,
        message,
        icon: 'checkmark-circle',
        iconColor: '#10b981',
        buttons: [
          {
            text: 'OK',
            style: 'primary',
            onPress: () => {
              hideModal();
              onClose?.();
            },
          },
        ],
      });
    },
    [showModal, hideModal]
  );

  const showError = useCallback(
    (title: string, message?: string, onClose?: () => void) => {
      showModal({
        title,
        message,
        icon: 'alert-circle',
        iconColor: '#ef4444',
        buttons: [
          {
            text: 'OK',
            style: 'destructive',
            onPress: () => {
              hideModal();
              onClose?.();
            },
          },
        ],
      });
    },
    [showModal, hideModal]
  );

  const showInfo = useCallback(
    (title: string, message?: string, onClose?: () => void) => {
      showModal({
        title,
        message,
        icon: 'information-circle',
        iconColor: '#3b82f6',
        buttons: [
          {
            text: 'OK',
            style: 'primary',
            onPress: () => {
              hideModal();
              onClose?.();
            },
          },
        ],
      });
    },
    [showModal, hideModal]
  );

  const Modal = useCallback(
    () => (
      <CustomModal
        visible={visible}
        title={modalConfig.title}
        message={modalConfig.message}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
        buttons={modalConfig.buttons}
        onBackdropPress={hideModal}
      />
    ),
    [visible, modalConfig, hideModal]
  );

  return {
    Modal,
    showModal,
    hideModal,
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showInfo,
  };
}
