import Swal from 'sweetalert2';

const baseClasses = {
  popup: 'lunas-swal-popup',
  title: 'lunas-swal-title',
  htmlContainer: 'lunas-swal-text',
  confirmButton: 'swal-button swal-button-primary',
  cancelButton: 'swal-button swal-button-secondary',
};

const toastClasses = {
  popup: 'lunas-swal-toast',
  title: 'lunas-swal-toast-title',
};

function buildOptions(options = {}) {
  return {
    buttonsStyling: false,
    reverseButtons: true,
    customClass: baseClasses,
    ...options,
  };
}

async function confirmAction({
  title = 'Apakah Anda yakin?',
  text = '',
  confirmButtonText = 'Ya',
  cancelButtonText = 'Batal',
  confirmButtonClass = 'swal-button swal-button-primary',
}) {
  const result = await Swal.fire(
    buildOptions({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      customClass: {
        ...baseClasses,
        confirmButton: confirmButtonClass,
      },
    })
  );

  return result.isConfirmed;
}

function showSuccessToast(title) {
  return Swal.fire(
    buildOptions({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title,
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
      customClass: toastClasses,
    })
  );
}

function showErrorToast(title) {
  return Swal.fire(
    buildOptions({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title,
      showConfirmButton: false,
      timer: 2600,
      timerProgressBar: true,
      customClass: toastClasses,
    })
  );
}

function showErrorDialog(message, title = 'Terjadi kendala') {
  return Swal.fire(
    buildOptions({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Tutup',
    })
  );
}

export { confirmAction, showSuccessToast, showErrorToast, showErrorDialog };
