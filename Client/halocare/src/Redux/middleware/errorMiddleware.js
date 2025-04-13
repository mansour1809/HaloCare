


const errorMiddleware = store => next => action => {
  if (action.error) {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        icon: 'error',
        title: 'שגיאה בטעינת נתונים',
        text: action.error.message || 'אירעה שגיאה',
        confirmButtonText: 'בסדר', // Your custom button text
        allowOutsideClick: false, // Prevent closing by clicking outside
        allowEscapeKey: false,    // Prevent closing with Esc
      }).then(() => {
        next(action);
      });
    });

    return;
  }

  return next(action);
};


export default errorMiddleware;