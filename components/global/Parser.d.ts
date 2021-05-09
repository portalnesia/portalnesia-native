import React from 'react'
import { ScrollView } from 'react-native';

export function onLinkPagePress(id: string,yLayout: number,scrollRef: React.MutableRefObject<ScrollView>): void

interface ContentType {
    id: string;
    tag: string;
    name: string;
    y: number
}

export interface ParserProps {
    source: string;
    selectable?: boolean;
    iklan?: boolean;
    scrollRef: React.MutableRefObject<ScrollView>;
    yLayout?: number;
    onReceiveId:(data: ContentType[])=>void
}

export interface MarkdownProps extends ParserProps {
    skipHtml?: boolean
}

export const Parser: React.MemoExoticComponent<React.FunctionComponent<ParserProps>>

export const Markdown: React.MemoExoticComponent<React.FunctionComponent<MarkdownProps>>