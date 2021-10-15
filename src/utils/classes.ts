function classes(...args: string[]) {
  return args.filter(Boolean).join(' ');
}

export default classes;
