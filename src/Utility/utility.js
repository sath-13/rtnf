const convertDate = (args) => {
  if (args) {
    const dt = args.split("T")[0];
    const date = new Date(dt).getUTCDate();
    const month = new Date(dt).getUTCMonth() + 1;
    const year = new Date(dt).getUTCFullYear();
    return `${date}-${month}-${year}`;
  } else {
    return "";
  }
};

export { convertDate };
