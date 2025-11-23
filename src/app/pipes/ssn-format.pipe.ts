import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ssnFormat'
})
export class SsnFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, mask: boolean = true): string {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 9) return value;
    if (mask) {
      // Mask all but last 4 digits
      return `XXX-XX-${cleaned.slice(-4)}`;
    }
    // Show full SSN
    return `${cleaned.slice(0,3)}-${cleaned.slice(3,5)}-${cleaned.slice(5)}`;
  }
}
