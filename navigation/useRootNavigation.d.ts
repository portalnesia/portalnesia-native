import React from 'react'
import {NavigationContainerRef, NavigationAction} from '@react-navigation/native'

export const navigationRef: React.Ref<NavigationContainerRef>

export function getPath(): string;

export function resetRoot(): void;

export function pushTo(path: string,parseLink?: boolean):void

export function linkTo(path: string,parseLink?: boolean):void

export function getActionLink(path: string): NavigationAction|undefined;

export function handleLinking(url: string): void;

export function getLink(link: string,a?:boolean): string;

export default function useRootNavigation(): {
    navigationRef: React.Ref<NavigationContainerRef>,
    linkTo:(path: string,parseLink?: boolean)=>void
}