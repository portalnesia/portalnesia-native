import applyWrapFormat from './applyWrapFormat';
import applyWrapFormatNewLines from './applyWrapFormatNewLines';
import applyListFormat from './applyListFormat';
import applyWebLinkFormat from './applyWebLinkFormat';
import { FormatType } from './types';

const Formats: FormatType[] = [
  { key: 'H1', title: 'Heading 1', prefix: '#', onPress: applyListFormat },
  { key: 'H2', title: 'Heading 2', prefix: '##', onPress: applyListFormat },
  { key: 'H3', title: 'Heading 3', prefix: '###', onPress: applyListFormat },
  { key: 'B', title: 'Bold', wrapper: '**', onPress: applyWrapFormat,icon:{name:'format-bold',pack:'material'}},
  { key: 'I', title: 'Italic', wrapper: '*', onPress: applyWrapFormat,icon:{name:'format-italic',pack:'material'}},
  {
    key: 'U',
    title: 'Underline',
    wrapper: '__',
    onPress: applyWrapFormat,
    icon:{name:'format-underline',pack:'material'}
  },
  {
    key: 'S',
    title: 'Strikethrough',
    wrapper: '~~',
    onPress: applyWrapFormat,
    icon:{name:'strikethrough-s',pack:'material'}
  },
  { key: 'WEB', title: 'Link', onPress: applyWebLinkFormat,icon:{name:'link',pack:'material'}},
  { key: 'C', title: 'Code', wrapper: '`', onPress: applyWrapFormat,icon:{name:'ios-code-sharp',pack:'ionicons'} },
  { key: 'CC', title: 'Code Block', wrapper: '```', onPress: applyWrapFormatNewLines,icon:{name:'ios-code-slash',pack:'ionicons'}},
  { key: 'L', title: 'Bulleted List', prefix: '-', onPress: applyListFormat,icon:{name:'format-list-bulleted',pack:'material'} },
  { key: 'LO', title: 'Numbered List', prefix: '1.', onPress: applyListFormat,icon:{name:'format-list-numbered',pack:'material'} },
];
export default Formats