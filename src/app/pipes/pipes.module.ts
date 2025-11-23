import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsnFormatPipe } from './ssn-format.pipe';
import { PhoneFormatPipe } from './phone-format.pipe';

@NgModule({
  declarations: [SsnFormatPipe, PhoneFormatPipe],
  imports: [CommonModule],
  exports: [SsnFormatPipe, PhoneFormatPipe]
})
export class PipesModule {}
