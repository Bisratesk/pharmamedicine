import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  // Fake extraction. The real backend will read the image (OCR) and return the medicine names.
  upload(file: File): Observable<string[]> {
    return of(['Paracetamol', 'Amoxicillin', 'Ibuprofen']).pipe(delay(1200));
  }
}