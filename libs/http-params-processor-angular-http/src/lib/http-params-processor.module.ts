import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParamsProcessorService } from '@adaskothebeast/http-params-processor-angular';

@NgModule({
  imports: [CommonModule],
  providers: [HttpParamsProcessorService],
})
export class HttpParamsProcessorModule {
  static forRoot(): ModuleWithProviders<HttpParamsProcessorModule> {
    return {
      ngModule: HttpParamsProcessorModule,
      providers: [HttpParamsProcessorService],
    };
  }
}
