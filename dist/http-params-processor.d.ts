import { HttpParams } from '@angular/common/http';
export declare class HttpParamsProcessor {
    process(key: string, obj: any): HttpParams;
    private processInternal;
    private addToHttpParams;
    private processObject;
    private processArray;
}
