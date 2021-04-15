
export interface BackdropProps {
    progress?: number;
    visible: boolean;
    onClose?: ()=>void;
    loading?: boolean;
    text?: string;
}


export default function Backdrop(props: BackdropProps): JSX.Element