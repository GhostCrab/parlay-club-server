export function fmt(instr: string | number, len: number, spacer = ' ') {
  const str = `${instr}`;
  if (str.length < len) {
    return spacer.repeat(len-str.length) + str;
  }

  return str;
}

export function postfmt(instr: string | number, len: number, spacer = ' ') {
  const str = `${instr}`;
  if (str.length < len) {
    const ret = str + spacer.repeat(len-str.length);
    return ret;
  }

  return str;
}