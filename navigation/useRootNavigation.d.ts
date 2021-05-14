import React from 'react'
import {NavigationContainerRef, NavigationAction} from '@react-navigation/native'

export const navigationRef: React.Ref<NavigationContainerRef>

export function getPath(): string;

export function resetRoot(): void;

export function pushTo(path: string,parseLink?: boolean):void

export function linkTo(path: string,parseLink?: boolean):void

export function getActionLink(path: string): NavigationAction|undefined;

export default function useRootNavigation(): {
    navigationRef: React.Ref<NavigationContainerRef>,
    linkTo:(path: string,parseLink?: boolean)=>void
}