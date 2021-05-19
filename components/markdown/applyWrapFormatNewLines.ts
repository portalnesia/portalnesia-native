import { SelectionType,FunctionArg } from './types';
import { replaceBetween } from './utils';

export default function applyWrapFormatNewLines({ getState, item, setState, setSelection }: FunctionArg){
  const { value, selection } = getState();
  let newText;
  let newPosition: number;
  if (selection.start === selection.end) {
    newPosition = selection.end + (item?.wrapper?.length||0) + (selection.end === 0 ? 1 : 2); // +2 For two new lines
    newText = replaceBetween(
      value,
      selection,
      `${selection.end === 0 ? '' : '\n'}${item?.wrapper?.concat(
        '\n',
        value.substring(selection.start, selection.end),
        '\n',
        item.wrapper,
        '\n',
      )}`,
    );
  } else {
    newPosition = selection.end + (item?.wrapper?.length||0) * 2 + 3; // +3 For three new lines
    newText = replaceBetween(
      value,
      selection,
      `${item?.wrapper?.concat(
        '\n',
        value.substring(selection.start, selection.end),
        '\n',
        item.wrapper,
        '\n',
      )}`,
    );
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