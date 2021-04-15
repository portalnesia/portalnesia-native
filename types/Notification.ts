export type ArrayNotificationType={
    picture: null|string,
    name: string,
    read: boolean,
    message: string,
    date: string,
    url: string,
    id?: string|number,
    type: string,
    as?: string,
    username?: string
}

export type DataNotificationType={
    error: number|boolean,
    status: string,
    total: number,
    notifications: ArrayNotificationType[]
} | null