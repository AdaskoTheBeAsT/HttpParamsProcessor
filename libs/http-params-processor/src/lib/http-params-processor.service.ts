import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpParamsProcessorService {
  process(
    key: string,
    obj: Record<string | number | symbol, unknown> | null | unknown | unknown[]
  ): HttpParams {
    let params = new HttpParams();
    params = this.processInternal(params, key, obj);
    return params;
  }

  private processInternal(
    params: HttpParams,
    key: string,
    obj: Record<string | number | symbol, unknown> | null | unknown | unknown[]
  ): HttpParams {
    if (obj == null) {
      return params;
    }

    if (Array.isArray(obj)) {
      return this.processArray(params, key, obj);
    } else if (
      typeof obj === 'object' &&
      Object.prototype.toString.call(obj) !== '[object Date]'
    ) {
      return this.processObject(
        params,
        key,
        obj as Record<string | number | symbol, unknown> | null
      );
    } else {
      return this.addToHttpParams(params, key, obj);
    }
  }

  private addToHttpParams(
    params: HttpParams,
    key: string,
    elem: unknown
  ): HttpParams {
    if (typeof elem === 'undefined' || elem == null) {
      return params;
    }

    return params.append(key, this.stringifyValue(elem));
  }

  private stringifyValue(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  private processObject(
    params: HttpParams,
    key: string,
    obj: Record<string, unknown> | null
  ): HttpParams {
    let retPar = params;
    for (const property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property)) {
        continue;
      }

      if (property === '$type') {
        continue;
      }
      const name = `${key}.${property}`;
      retPar = this.processInternal(retPar, name, obj[property]);
    }

    return retPar;
  }

  private processArray(
    params: HttpParams,
    key: string,
    arr: unknown[]
  ): HttpParams {
    let retPar = params;
    let index = 0;
    for (const item of arr) {
      const name = `${key}[${index}]`;
      index++;
      retPar = this.processInternal(retPar, name, item);
    }

    return retPar;
  }
}
