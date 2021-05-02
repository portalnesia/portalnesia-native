import {SWRResponse,SWRConfiguration} from 'swr'

export default function useSWR<D=any,E=any>(path: string,config:SWRConfiguration): SWRResponse<D,E>