import {UserType,TokenType} from '@pn/types/index'

export interface ReduxState {
    user: UserType;
    token: TokenType;
    session:string|null;
    theme:'light'|'dark';
    userTheme:'light'|'dark'|'auto';
    lang:'id'|'en'|'auto';
    isLogin:boolean;
    signature:null|string
}

export interface ReduxAction {
    type: string;
    payload?: Partial<ReduxState>|string
}

export type DispatchType = (args: ReduxAction) => ReduxState;