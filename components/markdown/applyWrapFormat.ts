import { SelectionType,FunctionArg } from './types';
import { replaceBetween } from './utils';

export default function applyWrapFormat({ getState, item, setState,setSelection }: FunctionArg){
  const { value, selection } = getState();
  const neww = replaceBetween(
    value,
    selection,
    `\n${item?.wrapper?.concat(
      '\n',
      value.substring(selection.start, selection.end),
      '\n',
      item.wrapper,
      '\n',
    )}`,
  );
  const newText = replaceBetween(
    value,
    selection,
    (item?.wrapper?.concat(value.substring(selection.start, selection.end), item?.wrapper||'')||''),
  );
  let newPosition: number;
  if (selection.start === selection.end) {
    newPosition = selection.end + (item?.wrapper?.length||0);
  } else {
    newPosition = selection.end + (item?.wrapper?.length||0) * 2;
  }
  const extra = {
    selection: {
      start: newPosition,
      end: newPosition,
    },
  };
  setState({ value: newText }, () => {
    setSelection({ ...extra });
  });
};