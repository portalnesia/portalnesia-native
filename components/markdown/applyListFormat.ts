import { SelectionType,FunctionArg } from './types';
import { replaceBetween } from './utils';

export default function applyListFormat({ getState, item, setState,setSelection }: FunctionArg){
  let { value } = getState();
  const { selection } = getState();
  value = value || '';
  let newvalue;
  let newSelection: SelectionType;
  if(selection.end === 0) {
    newvalue = replaceBetween(value, selection, `${item.prefix} `);
    newSelection = { start: selection.end + (item?.prefix?.length||0) + 1, end: selection.end + (item?.prefix?.length||0) + 1 };
  }
  else if (selection.start !== selection.end) {
    newvalue = replaceBetween(
      value,
      selection,
      `${item.prefix} ${value.substring(selection.start, selection.end)}\n`,
    );
    newSelection = { start: selection.end + 3, end: selection.end + 3 };
  } else if (
    selection.start === selection.end &&
    value.substring(selection.end - 1, selection.end) === '\n'
  ) {
    newvalue = replaceBetween(value, selection, `${item.prefix} `);
    newSelection = { start: selection.end + (item?.prefix?.length||0) + 1, end: selection.end + (item?.prefix?.length||0) + 1 };
  } else {
    newvalue = replaceBetween(value, selection, `\n${item.prefix} `);
    newSelection = { start: selection.end + (item?.prefix?.length||0) + 2, end: selection.end + (item?.prefix?.length||0) + 2 };
  }

  //setState({ value: newvalue })
  setState({ value: newvalue }, () => {
    setSelection({selection: newSelection})
  });
};