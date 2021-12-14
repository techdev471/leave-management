export const handleValidationError = (err) => {
  let errors = Object.values(err.errors).map((el) => el.message);
  let fields = Object.values(err.errors).map((el) => el.path);
  if (errors.length > 1) {
    const formattedErrors = errors.join(' ');
    return { messages: formattedErrors, fields: fields };
  }
  return { messages: errors, fields: fields };
};
export const intersectionArray = (array1 = [], array2 = []) =>
  array1.filter((value) => array2.includes(value));

export const cleanObject = (data) => {
  const keys = Object.keys(data).filter((k) => data[k] !== undefined);
  let parameter = {};
  keys.forEach((k) => {
    parameter[k] = data[k];
  });
  return parameter;
};
