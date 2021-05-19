import { SelectionType,FunctionArg } from './types';
import { isStringWebLink, replaceBetween } from './utils';
import { writeTextHereString, writeUrlTextHere } from './placeholderStrings';

export default function applyWebLinkFormat({ getState, item, setState,setSelection }: FunctionArg){
  const { selection, value } = getState();
  let newText;
  let newSelection: SelectionType;
  const selectedText = value.substring(selection.start, selection.end);
  if (selection.start !== selection.end) {
    if (isStringWebLink(selectedText)) {
      newText = replaceBetween(value, selection, `[${writeTextHereString}](${selectedText})`);
      newSelection = {
        start: selection.start + 1,
        end: selection.start + 1 + writeTextHereString.length,
      };
    } else {
      newText = replaceBetween(value, selection, `[${selectedText}](${writeUrlTextHere})`);
      newSelection = {
        start: selection.end + 3,
        end: selection.end + 3 + writeUrlTextHere.length,
      };
    }
  } else {
    newText = replaceBetween(value, selection, `[${writeTextHereString}](${writeUrlTextHere})`);
    newSelection = {
      start: selection.start + 1,
      end: selection.start + 1 + writeTextHereString.length,
    };
  }
  setState({ value: newText }, () => {
    setSelection({ selection: newSelection });
  });
};