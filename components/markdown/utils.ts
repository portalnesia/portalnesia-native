import { SelectionType } from './types';
import regexValidator from './webLinkValidator';

export const replaceBetween = (text: string, selection: SelectionType, what: string) =>
  text.substring(0, selection.start) + what + text.substring(selection.end);

export const isStringWebLink = (text: string): boolean => {
  const pattern = regexValidator;
  return pattern.test(text);
};