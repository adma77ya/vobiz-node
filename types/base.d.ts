export class VobizGenericResponse {
    constructor(params: object, idString: string);
    id: string;
}
export class VobizResource {
    constructor(action: string, Klass: Symbol, idField: string, request: any);
    // update(params: any, id: any): Promise<any>;
    delete(params: any): Promise<any>;
    executeAction(task: string, method: string, params: {}, action: string): Promise<any>;
    customexecuteAction(url: string, method?: string, params?: {}): Promise<any>;
    customexecuteGetNumberAction(url: string, method?: string, params?: {}): any;
    getMetaResponse(url: string, method?: string, params?: {}): Promise<any>;
}
export class VobizResourceInterface {
    constructor(action: string, Klass: Symbol, idField: string, request: any);
    // get(id: any, params?: {}): Promise<any>;
    // create(params: any): Promise<any>;
    list(params: any): Promise<any>;
}
