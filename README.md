# HttpParamsProcessor
Stores complex input parameters in Angular HttpParams for invoking GET to .net core web api.
HttpParams in angular collects parameters then in case of get call in translates it to proper url.
That url in backend side can be automatically converted to instance of class or simple type.

## Usage sample
    ```javascript
        const complexParams: ComplexParams = {
            id: 1,
            arr: [
                {
                    text: 'first query object',
                    innerArray: [1,2,3],
                },
                {
                    text: 'second query object',
                    innerArray: [1,2,3],
                },
            ],
        };

        @Injectable(
            { providedIn: 'root' }
        )
        export class WebApiService {
            constructor (
              @Inject(HttpClient) protected http: HttpClient,
              @Optional() @Inject(API_BASE_URL) protected baseUrl?: string,
              @Inject(HttpParamsProcessorService) protected processor: HttpParamsProcessorService) {
            }

            public get endpointServiceUrl(): string {
                if (this.baseUrl) {
                    return this.baseUrl.endsWith('/') ? this.baseUrl + 'api/endpoint' : this.baseUrl + '/' + 'api/endpoint';
                } else {
                    return 'api/endpoint';
                }
            }

            public getByQuery(query: ComplexParams): Observable<SomeDto> {
                const httpParams: HttpParams = this.processor.process('p', query);

                const headers = new HttpHeaders()
                    .set('Accept', 'application/json')
                    .set('If-Modified-Since', '0');

                return this.http.get<ResultDto>(
                    this.endpointServiceUrl,
                    {
                        headers: headers,
                        params: httpParams
                    });
            }
        }
    ```

## Part of url generated from above

  ```html
      .../api/endpoint?p.arr%5B0%5D.id=1&p.arr%5B0%5D.innerArr%5B0%5D.id=1.1&p.arr%5B0%5D.innerArr%5B0%5D.text=first%20first&p.arr%5B0%5D.innerArr%5B1%5D.id=1.2&p.arr%5B0%5D.innerArr%5B1%5D.text=first%20second&p.arr%5B1%5D.id=2&p.arr%5B1%5D.innerArr%5B0%5D.id=2.1&p.arr%5B1%5D.innerArr%5B0%5D.text=second%20first&p.arr%5B1%5D.innerArr%5B1%5D.id=2.2&p.arr%5B1%5D.innerArr%5B1%5D.text=second%20second'
  ```
  